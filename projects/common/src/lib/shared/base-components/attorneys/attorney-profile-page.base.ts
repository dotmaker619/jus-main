
import { ActivatedRoute, Router } from '@angular/router';
import { Attorney } from '@jl/common/core/models/attorney';
import { AttorneyEvent } from '@jl/common/core/models/attorney-event';
import { Role } from '@jl/common/core/models/role';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { EventsService } from '@jl/common/core/services/attorney/events.service';
import { AttorneysService } from '@jl/common/core/services/attorneys.service';
import { AuthService } from '@jl/common/core/services/auth.service';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { UsersService } from '@jl/common/core/services/users.service';
import { trackById } from '@jl/common/core/utils/trackby-id';
import { Observable, BehaviorSubject, of, combineLatest, NEVER, ReplaySubject, EMPTY, from } from 'rxjs';
import { catchError, shareReplay, switchMap, startWith, map, tap, first, mapTo, filter, switchMapTo, take } from 'rxjs/operators';

import { DialogsService } from '../../modules/dialogs/dialogs.service';

/** Base dialog infor for attorney-profile page. */
export interface DialogInfo {
  /** Dialog title. */
  title: string;
  /** Dialog message. */
  message: string;
}

const FAIL_DIALOG_INFO: DialogInfo = {
  title: 'Fail',
  message: 'Sorry, we were unable to process your request',
};

const LOGIN_REQUIRED_MESSAGE = 'You must be registered to Jus-Law.';

const IS_UPCOMING_EVENTS = true;

const EVENTS_ORDERING = 'start';

/** Base class for attorney profile page. */
export class BaseAttorneyProfilePage {
  /** Profile image fallback url. */
  public readonly profileImageFallbackUrl = '/assets/profile-image.png';
  /** Attorney. */
  public readonly attorney$: Observable<Attorney>;
  /** Joined list of specialties title. */
  public readonly attorneySpecialties$: Observable<string>;
  /** Joined list of practice jurisdictions state names. */
  public readonly practiceJurisdiction$: Observable<string>;
  /** Attorney's event list observable. */
  public readonly events$: Observable<AttorneyEvent[]>;
  /** Is attorney followed by the user. */
  public readonly isFollowed$: Observable<boolean>;
  /** Loading state. */
  public readonly isLoading$ = new BehaviorSubject<boolean>(false);
  /** Trackby function. */
  public trackById = trackById;
  /** Whether the `Follow` and `Chat` buttons are visible. */
  public readonly areContactButtonsVisible$: Observable<boolean>;

  /** Fail dialog info. */
  protected readonly failedFollowingDialogInfo = FAIL_DIALOG_INFO;
  /** Login required message text. */
  protected readonly loginRequiredMessage = LOGIN_REQUIRED_MESSAGE;

  private readonly followChange$ = new ReplaySubject<void>(1);
  private readonly isAuthenticated$: Observable<boolean>;

  /**
   * @constructor
   * @param activatedRoute
   * @param userService
   * @param usersService
   * @param attorneysService
   * @param dialogsService
   * @param eventsService
   * @param authService
   * @param router
   */
  constructor(
    protected readonly activatedRoute: ActivatedRoute,
    protected readonly userService: CurrentUserService,
    protected readonly usersService: UsersService,
    protected readonly attorneysService: AttorneysService,
    protected readonly dialogsService: DialogsService,
    protected readonly eventsService: EventsService,
    protected readonly authService: AuthService,
    protected readonly router: Router,
  ) {
    this.attorney$ = this.initAttorneyStream();
    this.isAuthenticated$ = this.initIsAuthenticatedStream();
    this.attorneySpecialties$ = this.initSpecialtiesStream();
    this.practiceJurisdiction$ = this.initPracticeJurisdictionStream();
    this.events$ = this.initEventsStream();
    this.isFollowed$ = this.initIsFollowedStream();
    this.areContactButtonsVisible$ = this.authService.userType$.pipe(
      map((role) => role === Role.Client),
    );
  }

  private initIsAuthenticatedStream(): Observable<boolean> {
    return this.userService.currentUser$.pipe(
      map(user => !!user),
    );
  }

  private initAttorneyStream(): Observable<Attorney> {
    return combineLatest([
      this.activatedRoute.params,
      this.followChange$.pipe(startWith(null)),
    ]).pipe(
      map(([params]) => parseInt(params.id, 10)),
      switchMap(id => this.usersService.getAttorneyById(id)),
      shareReplay({
        bufferSize: 1,
        refCount: true,
      }),
    );
  }

  private initSpecialtiesStream(): Observable<string> {
    return this.attorney$.pipe(
      filter(({ specialties }) => specialties != null),
      map(({ specialties }) =>
        specialties.map(specialty => specialty.title).join(', '),
      ),
    );
  }

  private initPracticeJurisdictionStream(): Observable<string> {
    return this.attorney$.pipe(
      filter(({ practiceJurisdictions }) => practiceJurisdictions != null),
      map(({ practiceJurisdictions }) =>
        practiceJurisdictions.map(state => state.name).join(', '),
      ),
    );
  }

  private initEventsStream(): Observable<AttorneyEvent[]> {
    return this.attorney$.pipe(
      switchMap((attorney) => {
        const upcoming = IS_UPCOMING_EVENTS;
        return this.eventsService.getEvents({
          attorney: attorney.id,
          upcoming,
          ordering: EVENTS_ORDERING,
        }).pipe(
          startWith(null),
          shareReplay({
            bufferSize: 1,
            refCount: true,
          }),
        );
      }),
    );
  }

  private initIsFollowedStream(): Observable<boolean> {
    return combineLatest([
      this.userService.currentUser$,
      this.attorney$,
    ]).pipe(
      map(([user, attorney]) => !!user && attorney.isFollowedBy(user.id)),
      startWith(false),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }
  /**
   * Follow or unfollow to attorney.
   *
   * @param isFollowed Following status.
   * @param attorneyName Attorney name.
   */
  public onFollowClicked(): void {
    const followData$ = combineLatest([
      this.isFollowed$,
      this.attorney$,
    ]);

    this.isAuthenticated$.pipe(
      first(),
      switchMap(isAuthenticated =>
        isAuthenticated ? followData$ :
          this.showLoginRequiredDialog(),
      ),
      switchMap(([isFollowed, attorney]) => {
        this.isLoading$.next(true);
        const action$ = isFollowed ?
          this.attorneysService.unfollowAttorney(attorney.id) :
          this.attorneysService.followAttorney(attorney.id);
        return action$.pipe(
          mapTo(this.getSuccessDialogInfo(
            isFollowed,
            attorney.fullName,
          )),
        );
      }),
      take(1),
      onMessageOrFailed(() => this.isLoading$.next(false)),
      tap(message => {
        this.followChange$.next();
        this.showSuccessfulFollowingDialog(message);
      }),
      catchError(() => {
        this.showFailedFollowingDialog(FAIL_DIALOG_INFO);
        return EMPTY;
      }),
    ).subscribe();
  }

  /** Show info about successful following. */
  protected showSuccessfulFollowingDialog(dialogInfo: DialogInfo): Promise<void> {
    return this.dialogsService.showInformationDialog(
      dialogInfo,
    );
  }

  /** Show info about failed following. */
  protected showFailedFollowingDialog(dialogInfo: DialogInfo): Promise<void> {
    return this.dialogsService.showInformationDialog(dialogInfo);

  }

  /**
   * Return follow/unfollow success dialog options.
   *
   * @param isFollowed Following status.
   * @param attorneyName Attorney name.
   */
  protected getSuccessDialogInfo(isFollowed: boolean, attorneyName: string): DialogInfo {
    const message = isFollowed
      ? `You have unfollowed ${attorneyName}. You will no longer receive notifications.`
      : `You have followed ${attorneyName}. You will get notified when an Attorney posts a new event or posts to the forum.`;

    return { title: 'Success', message };
  }

  /** Navigate to chats or show login required dialog. */
  public onStartChatClicked(attorney: Attorney): void {
    this.isAuthenticated$.pipe(
      first(),
      switchMap(isAuthenticated =>
        isAuthenticated ?
          of(isAuthenticated) : this.showLoginRequiredDialog()),
    ).subscribe(() => {
      this.router.navigate(['/chats'], { queryParams: { attorneyId: attorney.id } });
    });
  }

  /** Show login required dialog. */
  protected showLoginRequiredDialog(): Observable<never> {
    return from(this.dialogsService.showRedirectDialog(
      { message: this.loginRequiredMessage },
    )).pipe(
      switchMapTo(NEVER),
    );
  }
}

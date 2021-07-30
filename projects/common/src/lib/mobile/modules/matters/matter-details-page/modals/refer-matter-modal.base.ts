import { Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Matter } from '@jl/common/core/models';
import { TEntityValidationErrors, ApiValidationError } from '@jl/common/core/models/api-error';
import { Pagination } from '@jl/common/core/models/pagination';
import { ReferMatter } from '@jl/common/core/models/refer-matter';
import { Role } from '@jl/common/core/models/role';
import { User } from '@jl/common/core/models/user';
import { catchValidationError } from '@jl/common/core/rxjs';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { paginate } from '@jl/common/core/rxjs/paginate';
import { MattersService } from '@jl/common/core/services/attorney/matters.service';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { trackById } from '@jl/common/core/utils/trackby-id';
import { JusLawValidators } from '@jl/common/core/validators/validators';
import { AlertService } from '@jl/common/mobile/services/alert.service';
import { BehaviorSubject, Observable, ReplaySubject, Subject, EMPTY } from 'rxjs';
import {
  tap,
  take,
  switchMap,
  first,
  startWith,
  debounceTime,
  switchMapTo,
  mapTo,
  withLatestFrom,
  shareReplay,
  map,
  scan,
} from 'rxjs/operators';

type ReferTo = Role.Attorney | Role.Staff;

/**
 * Base class for modal window to refer matter with users.
 */
export abstract class BaseReferMatterModal implements OnInit {
  /** Matter to refer. */
  @Input()
  public matter: Matter;
  /** Refer form. */
  public readonly referForm: FormGroup;
  /** Loading controller. */
  public readonly isLoading$ = new BehaviorSubject(false);
  /** Loading controller for users list. */
  public readonly isUsersLoading$ = new BehaviorSubject(false);
  /** Users list. */
  public readonly users$: Observable<Pagination<User>>;
  /** Validation error. */
  public readonly validationError$ = new BehaviorSubject<TEntityValidationErrors<ReferMatter>>(null);
  /** TrackBy function by instance id. */
  public readonly trackById = trackById;
  /** Selected users */
  public readonly selectedUsers = new Array<User>();

  private readonly init$ = new ReplaySubject<void>(1);
  private readonly moreUsersRequested$ = new Subject<void>();

  /**
   * @constructor
   *
   * @param fb Form builder.
   * @param modalCtrl Modal controller.
   * @param alertService Alert service.
   * @param mattersService Matters service.
   * @param userService User service.
   * @param userType User type to work with.
   */
  public constructor(
    fb: FormBuilder,
    private readonly modalCtrl: ModalController,
    private readonly alertService: AlertService,
    private readonly mattersService: MattersService,
    private readonly userService: CurrentUserService,
    private readonly userType: ReferTo,
  ) {
    this.referForm = this.initFormGroup(fb);
    this.users$ = this.initUsersStream();
  }

  /** @inheritdoc */
  public ngOnInit(): void {
    this.init$.next();

    this.userService.currentUser$.pipe(
      tap((curUser) => this.selectedUsers.push(
        ...this.matter.sharedWith.filter(u => u.id !== curUser.id && u.role === this.userType)),
      ),
      take(1),
    ).subscribe();
  }

  /**
   * Handle 'submit' of the refer form.
   * @param form Refer form group instance.
   */
  public onFormSubmit(form: FormGroup): void {
    form.markAllAsTouched();
    if (form.invalid || this.isLoading$.value) {
      return;
    }

    const referMatterData = new ReferMatter({
      id: this.matter.id,
      title: form.value.title,
      message: form.value.message,
      emails: form.value.emails,
      users: this.selectedUsers.map((a) => a.id),
      userType: this.userType,
    });

    this.isLoading$.next(true);
    this.mattersService.referMatter(referMatterData, this.matter).pipe(
      onMessageOrFailed(() => this.isLoading$.next(false)),
      switchMap(() => this.showSuccessAlert()),
      first(),
      catchValidationError((error: ApiValidationError<ReferMatter>) => {
        this.isLoading$.next(false);
        this.validationError$.next(error.validationData);
        return EMPTY;
      }),
    ).subscribe(() => this.close());
  }

  /**
   * Handle user selection.
   * @param user User.
   */
  public onToggleUser(user: User): void {
    const userIdx = this.selectedUsers.findIndex(a => user.id === a.id);
    if (userIdx === -1) {
      this.selectedUsers.push(user);
    } else {
      this.selectedUsers.splice(userIdx, 1);
    }
  }

  /**
   * Handle 'click' of the 'Close' button.
   */
  public onCloseClick(): void {
    this.close();
  }

  /** Load next page of users. */
  public onLoadMoreUsers(): void {
    this.moreUsersRequested$.next();
  }

  /**
   * Search users.
   *
   * @param page Pagination page.
   * @param query Search query.
   */
  protected abstract searchUsers(page: number, query: string): Observable<Pagination<User>>;

  private initUsersStream(): Observable<Pagination<User>> {
    const queryChanges$ = this.referForm.get('filter').valueChanges
      .pipe(startWith(''), debounceTime(500));

    return this.init$.pipe(
      switchMapTo(paginate(
        this.moreUsersRequested$,
        queryChanges$.pipe(mapTo(null)),
      )),
      withLatestFrom(queryChanges$),
      tap(() => this.isUsersLoading$.next(true)),
      switchMap(([page, query]) => this.searchUsers(page, query)),
      switchMap((pagination) => this.filterUsers(pagination)),
      scan((acc, val) => ({
        ...val,
        items: val.page === 0 ? val.items : acc.items.concat(val.items),
      }), { items: [] } as Pagination<User>),
      tap(() => this.isUsersLoading$.next(false)),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
  }

  private filterUsers(pagination: Pagination<User>): Observable<Pagination<User>> {
    return this.userService.currentUser$.pipe(
      map((user) => ({
        ...pagination,
        items: pagination.items
          .filter((a) => a.id !== this.matter.attorney.id && a.id !== user.id),
      })),
    );
  }

  /** Check whether the user is selected. */
  public isUserSelected(user: User): boolean {
    return this.selectedUsers.some(u => u.id === user.id);
  }

  private initFormGroup(fb: FormBuilder): FormGroup {
    return fb.group({
      title: ['', []],
      message: ['', []],
      emails: [[]],
      filter: [''],
    });
  }

  private showSuccessAlert(): Promise<void> {
    return this.alertService.showNotificationAlert({
      buttonText: 'OK',
      header: 'Matter shared',
      message: 'Matter has been shared successfully',
    });
  }

  private close(): void {
    this.modalCtrl.dismiss();
  }
}

import { Component, ChangeDetectionStrategy, ViewChild, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SelectOption } from '@jl/common/core/models';
import { Activity } from '@jl/common/core/models/activity';
import { Matter } from '@jl/common/core/models/matter';
import { MatterStatus } from '@jl/common/core/models/matter-status';
import { Role } from '@jl/common/core/models/role';
import { ActivitiesService } from '@jl/common/core/services/attorney/activities.service';
import { MattersService } from '@jl/common/core/services/attorney/matters.service';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { trackById } from '@jl/common/core/utils/trackby-id';
import { Observable, Subject, BehaviorSubject, of, combineLatest, } from 'rxjs';
import { map, shareReplay, first, takeUntil, switchMap, startWith, finalize, tap } from 'rxjs/operators';

import { DialogsService } from '../../../../../shared/modules/dialogs/dialogs.service';
import { SideMenuComponent } from '../matter-details-page/components/side-menu/side-menu.component';

/** Tab model */
interface Tab {
  /** Id. */
  field: MatterStatus[];
  /** Title. */
  title: string;
  /** Observable with matters. */
  matters$?: Observable<Matter[]>;
}

const ATTORNEY_TABS: Tab[] = [
  { field: [MatterStatus.Active], title: 'Active' },
  { field: [MatterStatus.Pending, MatterStatus.Draft], title: 'Pending' },
  { field: [MatterStatus.Completed], title: 'Completed' },
  { field: [MatterStatus.Revoked], title: 'Revoked' },
];

const CLIENT_TABS: Tab[] = [
  { field: [MatterStatus.Active], title: 'Active' },
  { field: [MatterStatus.Pending], title: 'Pending' },
  { field: [MatterStatus.Completed], title: 'Completed' },
];

/** Matters page component */
@Component({
  selector: 'jlc-matters-page',
  templateUrl: './matters-page.component.html',
  styleUrls: ['./matters-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MattersPageComponent implements OnInit, OnDestroy {

  private readonly unsubscribe$ = new Subject<void>();

  /** Is component loading. */
  public readonly isLoading$ = new BehaviorSubject<boolean>(false);

  @ViewChild('sideMenu', { static: true })
  private sideMenu: SideMenuComponent;

  /** Roles. */
  public readonly roles = Role;

  /** Ordering options. */
  public readonly orderOptions: SelectOption[] = [
    { label: 'Most recent', value: '-created' },
    { label: 'Oldest', value: 'created' },
  ];

  /** Tabs. */
  public readonly tabs$: Observable<Tab[]>;

  /** Current order. */
  public readonly order$ = new BehaviorSubject<string>(this.orderOptions[0].value.toString());

  /** Emits on actions connected with matters (revoke, cancel etc.) */
  public readonly mattersChange$ = new Subject<void>();

  /** All the matters of attorney. */
  public readonly matters$ = combineLatest([
    this.order$,
    this.mattersChange$.pipe(startWith(undefined)),
  ]).pipe(
    switchMap(([order]) =>
      this.matterService.getMatters({ order }).pipe(startWith(null)),
    ),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  /** Subject for emitting a matter change. */
  public readonly selectedMatter$ = new Subject<Matter>();

  /** Current selected matter. */
  public selectedMatter: Matter;

  /** Activities connected with matter. */
  public matterActivities$: Observable<Activity[]>;

  /** Matter status. */
  public readonly MatterStatus = MatterStatus;
  /** Trakby function. */
  public trackById = trackById;

  /**
   * @constructor
   * @param matterService Matter service.
   * @param activityService Activities service.
   * @param dialogService Dialogs service.
   * @param router Router.
   * @param activatedRoute Activated route.
   * @param userService User service.
   */
  public constructor(
    private readonly matterService: MattersService,
    private readonly activityService: ActivitiesService,
    private readonly dialogService: DialogsService,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly userService: CurrentUserService,
  ) {
    this.tabs$ = this.userService.currentUser$.pipe(
      first(),
      map(({ role }) => role === Role.Attorney ? ATTORNEY_TABS : CLIENT_TABS),
      tap(tabs => {
        tabs.forEach(tab =>
          tab.matters$ = this.matters$.pipe(
            map((matters) => matters && matters.filter(matter => tab.field.includes(matter.status as MatterStatus))),
          ),
        );
      }),
    );

  }

  private clearDocusignParams(): void {
    this.router.navigate(['.'], {
      relativeTo: this.activatedRoute,
      queryParamsHandling: 'merge',
      queryParams: {
        envelopeId: null,
        event: null,
      },
    });
  }

  /** @inheritdoc */
  public ngOnInit(): void {
    // Clear query params so that the user won't see any redirect info
    this.clearDocusignParams();

    // Unselect matter when menu is closed.
    this.sideMenu.stateChanged
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((event) => {
        if (event === 'close') {
          this.selectedMatter = null;
        }
      });

    // Stream with selected matters.
    const selectedMatterStream = this.selectedMatter$
      .pipe(
        takeUntil(this.unsubscribe$),
        map((matter) => {
          // Unselect matter if it is double-clicked.
          if (
            matter && this.selectedMatter &&
            matter.id === this.selectedMatter.id
          ) {
            return null;
          }
          return matter;
        }),
        shareReplay({ bufferSize: 1, refCount: true }),
      );

    // Set activities for matter
    this.matterActivities$ = selectedMatterStream.pipe(
      switchMap(matter => {
        if (matter) {
          return this.activityService.getActivities(matter).pipe(
            // To avoid saving previous activities while loading.
            startWith(null),
          );
        }
        return of([]);
      }),
    );

    // Toggle side menu on matter change.
    selectedMatterStream.subscribe((matter) => {
      if (!matter) {
        this.sideMenu.close();
      } else {
        this.sideMenu.open();
      }
      this.selectedMatter = matter;
    });
  }

  /**
   * Change ordering.
   * @param value
   */
  public onOrderChange(value: string): void {
    this.order$.next(value);
  }

  /**
   * Select matter and open side menu.
   * @param matter
   */
  public onMatterClick(matter: Matter): void {
    this.selectedMatter$.next(matter);
  }

  /** @inheritdoc */
  public ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  /**
   * Revoke matter.
   * @param matter
   */
  public async onCancelMatterClick(matter: Matter): Promise<void> {
    const revokeMatter = await this.dialogService.showConfirmationDialog({
      title: 'Revoke Matter',
      message: `Are you sure you want to revoke [${this.selectedMatter.code}] ${this.selectedMatter.title} ?`,
      confirmationButtonClass: 'danger',
      cancelButtonText: 'Cancel',
      confirmationButtonText: 'Revoke Matter',
    });

    if (revokeMatter) {
      this.isLoading$.next(true);
      this.matterService.setMatterStatus(matter, MatterStatus.Revoked as MatterStatus)
        .pipe(
          first(),
          takeUntil(this.unsubscribe$),
          finalize(() => this.isLoading$.next(false)),
        ).subscribe(async () => {
          await this.dialogService.showInformationDialog({
            title: 'Matter Revoked',
            message: `[${this.selectedMatter.code}] ${this.selectedMatter.title} has been revoked and the client has been notified.`,
          });
          this.mattersChange$.next();
          this.sideMenu.close();
        });
    }

  }

  /**
   * Reopen matter.
   * @param matter
   */
  public onReopenMatterClick(matter: Matter): void {
    this.isLoading$.next(true);
    this.matterService.setMatterStatus(matter, MatterStatus.Active as MatterStatus)
      .pipe(
        first(),
        takeUntil(this.unsubscribe$),
        finalize(() => this.isLoading$.next(false)),
      ).subscribe(() => {
        this.mattersChange$.next();
        this.sideMenu.close();
      });
  }

  /**
   * trackSelectOptions
   * @param value
   */
  public trackSelectOptions(_: number, { value }: SelectOption): string | number {
    return value;
  }
}

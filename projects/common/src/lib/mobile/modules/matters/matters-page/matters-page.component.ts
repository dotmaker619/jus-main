import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DestroyableBase } from '@jl/common/core';
import { SelectOption } from '@jl/common/core/models';
import { MatterStatus } from '@jl/common/core/models/matter-status';
import { Role } from '@jl/common/core/models/role';
import { MattersService } from '@jl/common/core/services/attorney/matters.service';
import { AuthService } from '@jl/common/core/services/auth.service';
import { Observable, combineLatest, NEVER, merge, of, BehaviorSubject } from 'rxjs';
import { map, shareReplay, tap, mapTo, startWith, filter, switchMapTo } from 'rxjs/operators';

interface FilteringFormValue {
  /** Order. */
  order: string;
}

/** Tab model */
interface Tab {
  /** Title. */
  title: string;
  /** Absolute path */
  absolutePath: string;
  /** Matters count . */
  count$: BehaviorSubject<number>;
}

/** Matters counters. */
interface MattersCount {
  /** Number of active matters. */
  active: number;
  /** Number of pending matters. */
  pending: number;
  /** Number of completed matters. */
  completed: number;
  /** Number of revoked matters. */
  revoked: number;
}

/** Matters page for mobile workspace. */
@Component({
  selector: 'jlc-matters-page',
  templateUrl: './matters-page.component.html',
  styleUrls: ['./matters-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MattersPageComponent extends DestroyableBase {

  /** Matters counters. */
  public mattersCount$: Observable<MattersCount>;

  /** Filtering form. */
  public filteringForm$: Observable<FormGroup>;

  /** Roles. */
  public roles = Role;

  /** Ordering options. */
  public readonly orderOptions: SelectOption[] = [
    { label: 'Most recent', value: '-created' },
    { label: 'Oldest', value: 'created' },
  ];

  /** Tabs. */
  public readonly tabs$: Observable<Tab[]>;

  private readonly activeTab: Tab = {
    title: 'Active',
    absolutePath: '/matters/list/active',
    count$: new BehaviorSubject(null),
  };
  private readonly pendingTab: Tab = {
    title: 'Pending',
    absolutePath: '/matters/list/pending',
    count$: new BehaviorSubject(null),
  };
  private readonly completedTab: Tab = {
    title: 'Completed',
    absolutePath: '/matters/list/completed',
    count$: new BehaviorSubject(null),
  };
  private readonly revokedTab: Tab = {
    title: 'Revoked',
    absolutePath: '/matters/list/revoked',
    count$: new BehaviorSubject(null),
  };

  /**
   * @constructor
   *
   * @param mattersService Matters service.
   * @param router Router.
   * @param formBuilder Form builder.
   * @param activatedRoute Activated route.
   * @param authService Auth service.
   */
  public constructor(
    private readonly mattersService: MattersService,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
  ) {
    super();
    this.mattersCount$ = this.initMattersCounterStream();
    this.tabs$ = this.initTabsStream();
    this.filteringForm$ = this.initFilteringFormStream();
  }

  /** On order change. */
  public onFilteringChange(formValue: FilteringFormValue): void {
    this.router.navigate([], {
      queryParams: {
        order: formValue.order,
      },
    });
  }

  private initTabsStream(): Observable<Tab[]> {
    let tabs: Tab[];
    if (this.authService.userType$.value === Role.Attorney) {
      tabs = [this.activeTab, this.pendingTab, this.completedTab, this.revokedTab];
    } else {
      tabs = [this.activeTab, this.pendingTab, this.completedTab];
    }
    const fillMattersCount$ = this.mattersCount$.pipe(
      tap((mattersCount) => {
        this.activeTab.count$.next(mattersCount.active);
        this.pendingTab.count$.next(mattersCount.pending);
        this.completedTab.count$.next(mattersCount.completed);
        this.revokedTab.count$.next(mattersCount.revoked);
      }),
      switchMapTo(NEVER),
    );

    return merge(of(tabs), fillMattersCount$);
  }

  /**
   * Init matters count stream
   */
  private initMattersCounterStream(): Observable<MattersCount> {
    return this.mattersService.getMatters().pipe(
      map(matters => {
        return {
          active: matters.filter(matter => matter.status === MatterStatus.Active).length,
          pending: matters.filter(matter => matter.status === MatterStatus.Pending).length,
          completed: matters.filter(matter => matter.status === MatterStatus.Completed).length,
          revoked: matters.filter(matter => matter.status === MatterStatus.Revoked).length,
        } as MattersCount;
      }),
      shareReplay({
        refCount: true,
        bufferSize: 1,
      }),
    );
  }

  private initFilteringFormStream(): Observable<FormGroup> {
    const form = this.formBuilder.group({
      order: [this.orderOptions[0].value],
    });

    // When query param is somehow changed to null - we want to set the default param.
    const queryParamGotNull$ = this.activatedRoute.queryParams.pipe(
      map(params => params.order),
      filter(order => order == null),
      startWith(null),
    );

    const valueChange$ = form.valueChanges.pipe(startWith(form.value));

    return combineLatest([
      valueChange$,
      queryParamGotNull$,
    ]).pipe(
      tap(([value]) => this.onFilteringChange(value)),
      mapTo(form),
    );
  }

  /**
   * Handle click on 'create matter' button. Opens modal window.
   */
  public async onCreateMatterClick(): Promise<void> {
    this.router.navigate(['/matters/create']);
  }
}

import { ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { DestroyableBase } from '@jl/common/core';
import { Invoice } from '@jl/common/core/models/invoice';
import { InvoicesTabDescription } from '@jl/common/core/models/invoice-tab-description';
import { InvoiceService } from '@jl/common/core/services/invoice.service';
import { JusLawDateUtils } from '@jl/common/core/utils/date-utils';
import { Observable, ReplaySubject, combineLatest, NEVER, merge, of, Subject } from 'rxjs';
import { map, startWith, switchMap, first, tap, switchMapTo, shareReplay, withLatestFrom } from 'rxjs/operators';

interface InvoicesTab extends InvoicesTabDescription {
  /** Filter form. */
  filterForm: FormGroup;
  /** Invoices */
  invoices: Invoice[];
  /** Total count of invoices. */
  totalCount: number;
}

/** Available invoice tabs. */
enum Tabs {
  /** Unpaid. */
  Unpaid = 'Unpaid',
  /** Paid. */
  Paid = 'Paid',
  /** Sent */
  Sent = 'Sent',
  /** Pending */
  Pending = 'Pending',
}

const INITIAL_DATE = new Date();

/**
 * Base class for desktop invoices pages.
 */
export abstract class BaseInvoicesPage extends DestroyableBase {
  /** Should display searchbar. */
  public shouldDisplaySearchbar = false;
  /** Tabs: pending, sent */
  public readonly tabs$: Observable<InvoicesTab[]>;

  /** Selected tab. */
  public readonly selectedTab$: Observable<InvoicesTab>;

  private readonly updateSelectedTab$ = new ReplaySubject<string>();

  /** Update invoices. */
  protected readonly update$ = new Subject();

  /**
   * @constructor
   *
   * @param tabsDescription Invoice tabs description.
   * @param modalCtrl Modal controller.
   * @param cdr Change detection reference.
   * @param fb Form builder.
   * @param invoiceService Invoice service.
   * @param route Current route.
   * @param router Router.
   */
  public constructor(
    tabsDescription: InvoicesTabDescription[],
    protected readonly modalCtrl: ModalController,
    private readonly cdr: ChangeDetectorRef,
    private readonly fb: FormBuilder,
    private readonly invoiceService: InvoiceService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {
    super();
    this.tabs$ = this.initTabsStream(tabsDescription);
    this.selectedTab$ = this.updateSelectedTab$.pipe(
      withLatestFrom(this.tabs$),
      map(([selectedTabName, tabs]) => tabs.find(t => t.name === selectedTabName)),
      shareReplay({bufferSize: 1, refCount: true}),
    );
  }

  /**
   * Init tabs stream.
   *
   * @param tabDescriptions Tabs description.
   */
  public initTabsStream(tabDescriptions: InvoicesTabDescription[]): Observable<InvoicesTab[]> {
    return combineLatest(tabDescriptions.map(description => this.initTabStream(description)));
  }

  /** On tab change. */
  public onTabChange(tab: Tabs): void {
    this.updateSelectedTab$.next(tab);
  }

  /** On query change. */
  public onQueryChange(query: string): void {
    this.router.navigate([], {
      queryParams: {
        query,
      },
    });
  }

  /** On search button click. */
  public onSearchButtonClick(): void {
    this.shouldDisplaySearchbar = !this.shouldDisplaySearchbar;

    if (!this.shouldDisplaySearchbar) {
      this.onQueryChange('');
    }
  }

  private initTabStream(tabDescription: InvoicesTabDescription): Observable<InvoicesTab> {
    const tab = this.createTabFromDescription(tabDescription);

    const controls = tab.filterForm.controls;

    const updateInvoices$ = new ReplaySubject<Invoice[]>();

    const periodChange$ = controls.month.valueChanges.pipe(
      startWith(controls.month.value),
      map(date => JusLawDateUtils.makeMonthPeriod(new Date(date))),
    );

    const queryChange$ = this.route.queryParamMap.pipe(
      map(params => params.get('query')),
      startWith(''),
    );

    const invoicesUpdateSideEffect$ = combineLatest([
      periodChange$,
      queryChange$,
      this.update$.pipe(startWith(null)),
    ]).pipe(
      switchMap(([period, query]) => this.invoiceService.getInvoices({
        query,
        fromDate: period.from,
        toDate: period.to,
        statuses: tab.status,
      }).pipe(first())),
      tap(invoicesForTab => {
        tab.invoices = invoicesForTab;
        tab.totalCount = invoicesForTab.length;
      }),
    );

    const sideEffectAssemble$ = combineLatest([
      invoicesUpdateSideEffect$,
    ]).pipe(
      tap(() => this.cdr.markForCheck()), // Mark for check after updating the invoices.
      switchMapTo(NEVER),
    );

    return merge(of(tab), sideEffectAssemble$).pipe(
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
  }

  private createTabFromDescription(tabDescription: InvoicesTabDescription): InvoicesTab {
    const form = this.fb.group({
      month: [INITIAL_DATE.toString()],
    });

    return {
      filterForm: form,
      invoices: [],
      totalCount: null,
      ...tabDescription,
    };
  }
}

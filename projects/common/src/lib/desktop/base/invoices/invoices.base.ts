import { ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDatepicker } from '@angular/material';
import { DestroyableBase } from '@jl/common/core';
import { Invoice } from '@jl/common/core/models/invoice';
import { InvoicesTabDescription } from '@jl/common/core/models/invoice-tab-description';
import { Role } from '@jl/common/core/models/role';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { InvoiceService } from '@jl/common/core/services/invoice.service';
import { JusLawDateUtils } from '@jl/common/core/utils/date-utils';
import { DialogsService } from '@jl/common/shared';
import { Observable, ReplaySubject, Subject, combineLatest, NEVER, merge, of } from 'rxjs';
import { startWith, map, filter, switchMap, first, tap, switchMapTo, shareReplay, takeUntil } from 'rxjs/operators';

import { ExportStatisticsDialogComponent } from '../../components/export-statistics/export-statistics.component';

interface InvoicesTab extends InvoicesTabDescription {
  /** Filter form. */
  filterForm: FormGroup;
  /** Invoices */
  invoices: Invoice[];
  /** Total count of invoices. */
  totalCount: number;
}

const INVOICES_MIN_FILTER_DATE = new Date(1970, 0);

/**
 * Base class for desktop invoices pages.
 */
export abstract class BaseInvoicesPage extends DestroyableBase {

  /** Tabs: pending, sent */
  public readonly tabs$: Observable<InvoicesTab[]>;

  /** Is export button available. */
  public readonly isExportAvailable$: Observable<boolean>;

  /** Ordering change. */
  private orderingChange$ = new ReplaySubject<[string, InvoicesTab]>(1);

  /** Update invoices. */
  protected readonly update$ = new Subject();

  /**
   * @constructor
   * @param invoiceService Invoice service.
   * @param curUserService Service to work with the current user.
   * @param formBuilder Form builder.
   * @param dialogsService Dialogs service.
   * @param cdr Change detector.
   * @param tabsDesc Tabs description.
   */
  public constructor(
    private readonly invoiceService: InvoiceService,
    protected readonly formBuilder: FormBuilder,
    protected readonly dialogsService: DialogsService,
    protected readonly cdr: ChangeDetectorRef,
    curUserService: CurrentUserService,
    tabsDesc: InvoicesTabDescription[],
  ) {
    super();
    this.tabs$ = this.initTabsStream(tabsDesc);
    this.isExportAvailable$ = curUserService.currentUser$.pipe(
      map(user => user.role === Role.Attorney),
    );
  }

  /**
   * Handle 'click' of the 'Export' button.
   */
  public onExportInvoicesClick(): void {
    this.dialogsService.openDialog(ExportStatisticsDialogComponent);
  }

  /**
   * Init tabs stream.
   *
   * @param tabDescriptions Tabs description.
   */
  public initTabsStream(tabDescriptions: InvoicesTabDescription[]): Observable<InvoicesTab[]> {
    return combineLatest(tabDescriptions.map(description => this.initTabStream(description)));
  }

  private initTabStream(tabDescription: InvoicesTabDescription): Observable<InvoicesTab> {
    const tab = this.createTabFromDescription(tabDescription);

    const controls = tab.filterForm.controls;

    const updateInvoices$ = new ReplaySubject<Invoice[]>();

    updateInvoices$
      .pipe(takeUntil(this.destroy$))
      .subscribe(invoices => tab.invoices = invoices);

    const queryChange$ = controls.query.valueChanges.pipe(
      startWith(controls.query.value),
    );
    const periodChange$ = controls.month.valueChanges.pipe(
      startWith(controls.month.value),
      map(date => JusLawDateUtils.makeMonthPeriod(date)),
    );
    const orderChange$ = this.orderingChange$.pipe(
      filter(([_, tabWithChanges]) => tabWithChanges.name === tab.name),
      map(([order]) => order),
    );

    const invoicesUpdateSideEffect$ = combineLatest([
      queryChange$,
      periodChange$,
      orderChange$,
      this.update$.pipe(startWith(null)),
    ]).pipe(
      switchMap(([query, period, order]) => this.invoiceService.getInvoices({
        query,
        order,
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

  /**
   * Close datepicker after month selection to prevent opening modal for day selection.
   * @param date Date.
   * @param datepicker Datepicker element.
   * @param form Form group.
   */
  public onMonthSelected(date: Date, datepicker: MatDatepicker<Date>, form: FormGroup): void {
    form.controls.month.setValue(date);
    datepicker.close();
  }

  /**
   * Filter dates for time billing datepicker.
   * @param date
   */
  public filterDatesForMatter(this: void, date: Date): boolean {
    return +date > +INVOICES_MIN_FILTER_DATE && +date < +new Date();
  }

  private createTabFromDescription(tabDescr: InvoicesTabDescription): InvoicesTab {
    const form = this.formBuilder.group({
      query: [],
      month: [new Date()],
    });

    return {
      filterForm: form,
      invoices: [],
      totalCount: null,
      ...tabDescr,
    };
  }

  /** On ordering change. */
  public onOrderChange(order: string, tab: InvoicesTab): void {
    this.orderingChange$.next([order, tab]);
  }
}

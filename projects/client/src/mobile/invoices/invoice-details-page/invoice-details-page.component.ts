import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Invoice } from '@jl/common/core/models/invoice';
import { TimeBillingService, BillingPagination } from '@jl/common/core/services/attorney/time-billing.service';
import { InvoiceService } from '@jl/common/core/services/invoice.service';
import { Observable } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';

/** Invoice details page. */
@Component({
  selector: 'jlcl-invoice-details-page',
  templateUrl: './invoice-details-page.component.html',
  styleUrls: ['./invoice-details-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceDetailsPageComponent {
  /** Time billings with pagination */
  public readonly timeBillings$: Observable<BillingPagination>;
  /** Page title stream. */
  public readonly pageTitle$: Observable<string>;
  /** Invoice */
  public readonly invoice$: Observable<Invoice>;

  /**
   * @constructor
   * @param route Activated route.
   * @param invoicesService Invoices service.
   * @param billingService Billing service.
   */
  public constructor(
    route: ActivatedRoute,
    private readonly invoicesService: InvoiceService,
    private readonly billingService: TimeBillingService,
  ) {
    const id$ = route.paramMap.pipe(
      map(params => parseInt(params.get('id'), 10)),
    );
    this.invoice$ = this.initInvoiceStream(id$);
    this.timeBillings$ = this.initTimeBillingStream(id$);
    this.pageTitle$ = this.initPageTitleStream();
  }

  private initTimeBillingStream(id$: Observable<number>): Observable<BillingPagination> {
    return id$.pipe(
      switchMap((id) => this.billingService.getAllTimeBillingsForInvoice(id)),
      shareReplay({refCount: true, bufferSize: 1}),
    );
  }

  private initPageTitleStream(): Observable<string> {
    return this.invoice$.pipe(
      map(invoice => invoice.title),
    );
  }

  private initInvoiceStream(id$: Observable<number>): Observable<Invoice> {
    return id$.pipe(
      switchMap(id => this.invoicesService.getInvoiceById(id)),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
  }
}

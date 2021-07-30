import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Link } from '@jl/common/core/models';
import { Invoice } from '@jl/common/core/models/invoice';
import { TimeBillingService, BillingPagination } from '@jl/common/core/services/attorney/time-billing.service';
import { InvoiceService } from '@jl/common/core/services/invoice.service';
import { Observable, combineLatest } from 'rxjs';
import { map, switchMap, shareReplay } from 'rxjs/operators';

interface InvoiceAndBillings {
  /** Invoice */
  invoice: Invoice;
  /** Billings pagination */
  billings: BillingPagination;
}

/**
 * Invoice details.
 */
@Component({
  selector: 'jlcl-invoice-details',
  templateUrl: './invoice-details.component.html',
  styleUrls: ['./invoice-details.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceDetailsComponent {
  /** Invoice and billings as observable. */
  public readonly invoiceAndBillings$: Observable<InvoiceAndBillings>;
  /** Breadcrumb links. */
  public readonly breadcrumbs$: Observable<Link<string[]>[]>;
  /**
   * @constructor
   *
   * @param route Activated route.
   * @param invoiceService Invoice service.
   * @param timeBillingService Time billing service.
   */
  public constructor(
    route: ActivatedRoute,
    private readonly invoiceService: InvoiceService,
    private readonly timeBillingService: TimeBillingService,
  ) {
    const id$ = route.paramMap.pipe(
      map((params) => parseInt(params.get('id'), 10)),
    );
    const invoice$ = this.initInvoiceStream(id$);
    const timeBilling$ = this.initTimeBillingStream(id$);

    this.invoiceAndBillings$ = combineLatest([invoice$, timeBilling$])
      .pipe(map(([invoice, billings]) => ({ invoice, billings })));

    this.breadcrumbs$ = invoice$.pipe(
      map(({ id, title }) => [
        { label: 'Invoice', link: ['/invoices'] },
        { label: title, link: ['/invoices', id.toString()] },
      ]),
    );
  }

  private initInvoiceStream(id$: Observable<number>): Observable<Invoice> {
    return id$.pipe(
      switchMap((id) => this.invoiceService.getInvoiceById(id)),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }

  private initTimeBillingStream(id$: Observable<number>): Observable<BillingPagination> {
    return id$.pipe(
      switchMap((id) => this.timeBillingService.getAllTimeBillingsForInvoice(id)),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }
}

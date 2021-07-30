import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Invoice } from '@jl/common/core/models/invoice';
import { RateType } from '@jl/common/core/models/rate-type';
import { BillingPagination } from '@jl/common/core/services/attorney/time-billing.service';

/** Invocie details card. */
@Component({
  selector: 'jlc-invoice-details-card',
  templateUrl: './invoice-details-card.component.html',
  styleUrls: ['./invoice-details-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceDetailsCardComponent {
  /** Rate type */
  public readonly RateType = RateType;
  /** Whether 'client' or 'attorney' should be display in the layout */
  @Input()
  public isInfoForAttorney = true;

  /** Invoice. */
  @Input()
  public invoice: Invoice;

  /** Billing info. */
  @Input()
  public billings: BillingPagination;
}

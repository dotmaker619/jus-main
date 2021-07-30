import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Invoice } from '@jl/common/core/models/invoice';

/** Contains info on why invoice payment is not available. */
@Component({
  selector: 'jlc-payment-not-available',
  templateUrl: './payment-not-available.component.html',
  styleUrls: ['./payment-not-available.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentNotAvailableComponent {
  /** Invoice data. */
  @Input()
  public invoice: Invoice;
}

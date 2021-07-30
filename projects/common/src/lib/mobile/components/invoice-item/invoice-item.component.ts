import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Invoice } from '@jl/common/core/models/invoice';

/** Invoice item component. */
@Component({
  selector: 'jlc-invoice-item',
  templateUrl: './invoice-item.component.html',
  styleUrls: ['./invoice-item.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceItemComponent {
  /** Invoice. */
  @Input()
  public invoice: Invoice;
  /** Is component used for client or attorney/staff */
  @Input()
  public forClient = false;
}

import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { PaymentAccount } from '@jl/common/core/models/payment-account';

/**
 * Display information about bound payment method.
 */
@Component({
  selector: 'jlat-payment-method',
  templateUrl: './payment-method.component.html',
  styleUrls: ['./payment-method.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentMethodComponent {
  /** Payment account. */
  @Input()
  public paymentAccount: PaymentAccount;
  /** URL to stripe dashboard */
  @Input()
  public editLink: string;
}

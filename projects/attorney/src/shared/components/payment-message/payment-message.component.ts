import { Component, ChangeDetectionStrategy } from '@angular/core';

/**
 * Message for direct deposit page when a user doesn't have a stripe account.
 */
@Component({
  selector: 'jlat-payment-message',
  templateUrl: './payment-message.component.html',
  styleUrls: ['./payment-message.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentMessageComponent { }

import { Component, ChangeDetectionStrategy } from '@angular/core';
import { SubscriptionService } from '@jl/common/core/services/subscription.service';
import { AbstractDialog } from '@jl/common/shared';
import { BehaviorSubject } from 'rxjs';
import { first } from 'rxjs/operators';

/** Payment method dialog component */
@Component({
  selector: 'jlc-payment-method-dialog',
  templateUrl: './payment-method-dialog.component.html',
  styleUrls: ['./payment-method-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentMethodDialogComponent extends AbstractDialog<never, boolean> {
  /** Is initialized as observable */
  public readonly isInitialized$ = new BehaviorSubject(false);

  /**
   * Is saving of new payment method in progress.
   */
  public readonly isBusy$ = new BehaviorSubject(true);

  /** @constructor */
  public constructor(
    protected readonly paymentService: SubscriptionService,
  ) {
    super();
  }

  /** On close click */
  public onCloseClick(): void {
    this.close(false);
  }

  /**
   * On payment method form submitted.
   * @param paymentMethodId Payment method ID.
   */
  public onPaymentMethodFormSubmitted(paymentMethodId: string): void {
    this.isBusy$.next(true);
    this.paymentService.updatePaymentMethod(paymentMethodId)
      .pipe(first())
      .subscribe(() => this.close(true));
  }

  /** On payment method form component is ready */
  public onPaymentMethodFormComponentIsReady(): void {
    this.isBusy$.next(false);
  }
}

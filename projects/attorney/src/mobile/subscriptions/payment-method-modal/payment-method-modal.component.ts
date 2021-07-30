import { Component, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SubscriptionService } from '@jl/common/core/services/subscription.service';
import { PaymentMethodFormComponent } from '@jl/common/shared/components/payment-method-form/payment-method-form.component';
import {
  PaymentMethodDialogComponent,
} from '@jl/common/shared/modules/attorney-subscription/components/payment-method-dialog/payment-method-dialog.component';

/** Modal for updating payment method. Used in mobile workspace. */
@Component({
  selector: 'jlat-payment-method-modal',
  templateUrl: './payment-method-modal.component.html',
  styleUrls: ['./payment-method-modal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentMethodModalComponent extends PaymentMethodDialogComponent {

  /**
   * @constructor
   * @param paymentService Payment service.
   * @param modalController Modal controller.
   */
  public constructor(
    protected readonly paymentService: SubscriptionService,
    private readonly modalController: ModalController,
  ) {
    super(paymentService);
  }

  /** Payment method form. */
  @ViewChild(PaymentMethodFormComponent, { static: false })
  public paymentMethodForm: PaymentMethodFormComponent;

  /** On Submit clicked. */
  public onSubmitClick(): void {
    this.paymentMethodForm.submit();
  }

  /** @inheritdoc */
  public close(): void {
    this.modalController.dismiss();
  }
}

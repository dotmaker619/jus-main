import { DatePipe } from '@angular/common';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { JusLawSubscriptions as jls } from '@jl/common/core/models/subscriptions';
import { SubscriptionService } from '@jl/common/core/services/subscription.service';
import { DialogsService } from '@jl/common/shared';
import { CANCEL_SUBSCRIPTION_TEXT } from '@jl/common/shared/constants/subscription-constants';
import {
  SubscriptionPageComponent as SharedSubscriptionPageComponent,
} from '@jl/common/shared/modules/attorney-subscription/subscription-page/subscription-page.component';

import { AlertService } from '../../../../../common/src/lib/mobile/services/alert.service';
import { PaymentMethodModalComponent } from '../payment-method-modal/payment-method-modal.component';

/** Subscription page component for mobile device. */
@Component({
  selector: 'jlat-subscription-page',
  templateUrl: './subscription-page.component.html',
  styleUrls: ['./subscription-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe],
})
export class SubscriptionPageComponent extends SharedSubscriptionPageComponent {
  /**
   * @constructor
   * @param paymentService Payment service.
   * @param dialogsService Dialogs service.
   * @param alertService Alert service.
   * @param datePipe Date pipe.
   * @param modalController Modal controller.
   */
  public constructor(
    protected readonly paymentService: SubscriptionService,
    protected readonly dialogsService: DialogsService,
    private readonly alertService: AlertService,
    private readonly datePipe: DatePipe,
    private readonly modalController: ModalController,
  ) {
    super(
      paymentService,
      dialogsService,
    );
  }

  /** @inheritdoc */
  protected askForCancelSubscription(subscription: jls.Subscription): Promise<boolean> {
    return this.alertService.showConfirmation({
      isDangerous: true,
      buttonText: 'Cancel Plan',
      header: CANCEL_SUBSCRIPTION_TEXT.header,
      message: this.getCancelSubscriptionText(subscription),
    }).toPromise();
  }

  /** @inheritdoc */
  protected askForReactivateSubscription(): Promise<boolean> {
    return this.alertService.showConfirmation({
      header: 'Reactivate Subscription',
      message: 'The current subscription will be reactivated',
    }).toPromise();
  }

  private getCancelSubscriptionText(subscription: jls.Subscription): string {
    const expirationDateString = this.datePipe.transform(
      subscription.renewalDate,
      'MMM dd, yyyy');
    return [
      CANCEL_SUBSCRIPTION_TEXT.message1,
      CANCEL_SUBSCRIPTION_TEXT.getMessage2(
        expirationDateString),
    ].map(message => `<div>${message}</div>`).join('');
  }

  /** @inheritdoc */
  public async editPaymentMethod(): Promise<void> {
    const modal = await this.modalController.create({
      component: PaymentMethodModalComponent,
    });
    modal.present();
  }
}

import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { SubscriptionChangePreview } from '@jl/common/core/models/subscription-change-preview';
import { SubscriptionService } from '@jl/common/core/services/subscription.service';
import { DialogsService } from '@jl/common/shared';
import { DOWNGRADE_PLAN_TEXT, UPGRADE_PLAN_TEXT, ChangePlanTextTemplate } from '@jl/common/shared/constants/subscription-constants';
import {
  EditSubscriptionPageComponent as SharedEditSubscriptionPageComponent,
} from '@jl/common/shared/modules/attorney-subscription/edit-subscription-page/edit-subscription-page.component';

import { AlertService } from '../../../../../common/src/lib/mobile/services/alert.service';

/** Edit subscription page for mobile devices. */
@Component({
  selector: 'jlat-edit-subscription-page',
  templateUrl: './edit-subscription-page.component.html',
  styleUrls: ['./edit-subscription-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CurrencyPipe, DatePipe],
})
export class EditSubscriptionPageComponent extends SharedEditSubscriptionPageComponent {
  /**
   * @constructor
   * @param dialogsService Dialogs service.
   * @param paymentService Payment service.
   * @param formBuilder Form builder service.
   * @param router Router.
   * @param alertService Alert service.
   * @param datePipe Date pipe.
   * @param currencyPipe Currerncy pipe.
   */
  public constructor(
    protected readonly dialogsService: DialogsService,
    protected readonly paymentService: SubscriptionService,
    protected readonly formBuilder: FormBuilder,
    protected readonly router: Router,
    private readonly alertService: AlertService,
    private readonly datePipe: DatePipe,
    private readonly currencyPipe: CurrencyPipe,
  ) {
    super(dialogsService,
      paymentService,
      formBuilder,
      router);
  }

  /** @inheritdoc */
  protected askUserForDowngrade(changePreview: SubscriptionChangePreview): Promise<boolean> {
    const message = this.buildMessageForConfirm(DOWNGRADE_PLAN_TEXT, changePreview);
    return this.alertService.showConfirmation({
      header: DOWNGRADE_PLAN_TEXT.header,
      message,
      buttonText: 'Save',
    }).toPromise();
  }

  /** @inheritdoc */
  protected askUserForUpgrade(changePreview: SubscriptionChangePreview): Promise<boolean> {
    const message = this.buildMessageForConfirm(UPGRADE_PLAN_TEXT, changePreview);
    return this.alertService.showConfirmation({
      header: DOWNGRADE_PLAN_TEXT.header,
      message,
      buttonText: 'Save',
    }).toPromise();
  }

  /**
   * Preparer text message for a confirm.
   * @param changePreview Change preview.
   */
  private buildMessageForConfirm(
    textTemplate: ChangePlanTextTemplate,
    changePreview: SubscriptionChangePreview,
  ): string {
    const renewalDateString = this.datePipe.transform(
      changePreview.renewalDate,
      'MMM dd, yyyy',
    );
    const cost = this.currencyPipe.transform(
      changePreview.cost,
      'USD', 'symbol', '1.0-2',
    );
    const messages = [
      textTemplate.description,
      textTemplate.getChargeInfoText && textTemplate.getChargeInfoText(cost),
      textTemplate.getRenewalDateInfoText(renewalDateString),
    ].filter(message => message != null);

    return messages.map(
      // To have each message on a separate line.
      message => `<div>${message}</div>`,
    ).join('');
  }
}

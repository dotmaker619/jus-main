import { DatePipe, CurrencyPipe } from '@angular/common';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { SubscriptionChangePreview } from '@jl/common/core/models/subscription-change-preview';
import { AbstractDialog } from '@jl/common/shared';
import { ChangePlanTextTemplate } from '@jl/common/shared/constants/subscription-constants';

interface ChangeSubscriptionPlanDialogOptions {
  /**
   * Subscription change preview.
   */
  changePreview: SubscriptionChangePreview;

  /**
   * Change plant text template.
   */
  textTemplate: ChangePlanTextTemplate;
}

/** Upgrade plan dialog component */
@Component({
  selector: 'jlc-change-subscription-plan-dialog',
  templateUrl: './change-subscription-plan-dialog.component.html',
  styleUrls: [
    '../../styles/edit-subscription-dialog.css',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe, CurrencyPipe],
})
export class ChangeSubscriptionPlanDialogComponent extends AbstractDialog<ChangeSubscriptionPlanDialogOptions, boolean> {

  /**
   * @constructor
   * @param currencyPipe Currency pipe.
   * @param datePipe Date pipe.
   */
  public constructor(
    private currencyPipe: CurrencyPipe,
    private datePipe: DatePipe,
  ) {
    super();
  }

  /** Description text. */
  public get descriptionText(): string {
    return this.options.textTemplate.description;
  }

  /** Charge info. */
  public get chargeInfoText(): string {
    const getChargeText = this.options.textTemplate.getChargeInfoText;
    if (getChargeText == null) {
      return null;
    }
    return getChargeText(this.amount);
  }

  /** Renewal date. */
  public get renewalDateInfoText(): string {
    return this.options.textTemplate.getRenewalDateInfoText(this.renewalDate);
  }

  /** Amount */
  private get amount(): string {
    return this.currencyPipe.transform(
      this.options.changePreview.cost,
      'USD', 'symbol', '1.0-2',
    );
  }

  /** Renewal date */
  private get renewalDate(): string {
    return this.datePipe.transform(
      this.options.changePreview.renewalDate,
      'MMM dd, yyyy',
    );
  }

  /** On close click */
  public onCloseClick(): void {
    this.close(false);
  }

  /** On save click */
  public onSaveClick(): void {
    this.close(true);
  }
}

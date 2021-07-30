import { DatePipe } from '@angular/common';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { JusLawSubscriptions } from '@jl/common/core/models/subscriptions';
import { AbstractDialog } from '@jl/common/shared';
import { CANCEL_SUBSCRIPTION_TEXT } from '@jl/common/shared/constants/subscription-constants';

/**
 * Cancel subscription dialog options.
 */
export interface CancelSubscriptionDialogOptions {
  /**
   * Current payment profile.
   */
  subscription: JusLawSubscriptions.Subscription;
}

/** Cancel subscription dialog component */
@Component({
  selector: 'jlc-cancel-subscription-dialog',
  templateUrl: './cancel-subscription-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: [
    '../../styles/edit-subscription-dialog.css',
  ],
  providers: [DatePipe],
})
export class CancelSubscriptionDialogComponent extends AbstractDialog<CancelSubscriptionDialogOptions, boolean> {

  /**
   * @constructor
   * @param datePipe Date pipe.
   */
  public constructor(
    private readonly datePipe: DatePipe,
  ) {
    super();
  }

  /** Dialog messages. */
  public get messages(): string[] {
    return [
      CANCEL_SUBSCRIPTION_TEXT.message1,
      CANCEL_SUBSCRIPTION_TEXT.getMessage2(
        this.datePipe.transform(this.expirationDate, 'MMM dd, yyyy'),
      ),
    ];
  }

  /** Dialog title. */
  public get header(): string {
    return CANCEL_SUBSCRIPTION_TEXT.header;
  }

  /** Expires date */
  private get expirationDate(): Date {
    return this.options.subscription.renewalDate;
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

import { Component, ChangeDetectionStrategy } from '@angular/core';
import { JusLawSubscriptions as jls } from '@jl/common/core/models/subscriptions';
import { SubscriptionService } from '@jl/common/core/services/subscription.service';
import { DialogsService } from '@jl/common/shared';
import { Observable, EMPTY, from, BehaviorSubject } from 'rxjs';
import { shareReplay, switchMap, switchMapTo, map } from 'rxjs/operators';

import {
  CancelSubscriptionDialogComponent,
} from '../components/cancel-subscription-dialog/cancel-subscription-dialog.component';
import {
  PaymentMethodDialogComponent,
} from '../components/payment-method-dialog/payment-method-dialog.component';

/** Subscription page component */
@Component({
  selector: 'jlc-subscription-page',
  templateUrl: './subscription-page.component.html',
  styleUrls: ['./subscription-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubscriptionPageComponent {
  /**
   * Current payment profile.
   */
  public readonly currentPaymentProfile$: Observable<jls.PaymentProfile>;

  /**
   * Can cancel current subscription.
   */
  public readonly canCancel$: Observable<boolean>;

  /**
   * Can reactivate current subscription.
   */
  public readonly canReactivate$: Observable<boolean>;

  /**
   * Can edit current subscription.
   */
  public readonly canEdit$: Observable<boolean>;

  /**
   * Is component busy.
   */
  public readonly isBusy$ = new BehaviorSubject(false);

  /** @constructor */
  public constructor(
    protected readonly paymentService: SubscriptionService,
    protected readonly dialogsService: DialogsService,
  ) {
    this.currentPaymentProfile$ = this.paymentService.getCurrentProfile()
      .pipe(
        shareReplay({
          bufferSize: 1,
          refCount: true,
        }),
      );
    this.canCancel$ = this.createCanCancelStream(this.currentPaymentProfile$);
    this.canReactivate$ = this.createCanReactivateStream(this.currentPaymentProfile$);
    this.canEdit$ = this.createCanEditStream(this.currentPaymentProfile$);
  }

  /** Edit payment method */
  public editPaymentMethod(): void {
    this.dialogsService.openDialog(PaymentMethodDialogComponent);
  }

  /** Cancel subscription */
  public onCancelClicked(subscription: jls.Subscription): void {
    from(this.askForCancelSubscription(subscription))
      .pipe(
        switchMap(isConfirmed => {
          if (!isConfirmed) {
            return EMPTY;
          }
          this.isBusy$.next(true);
          return this.paymentService.cancelCurrentSubscription();
        }),
        switchMapTo(this.currentPaymentProfile$),
      )
      .subscribe(() => this.isBusy$.next(false));
  }

  /**
   * Ask user for cancelling a subscription.
   * @param subscription Subscription.
   */
  protected askForCancelSubscription(subscription: jls.Subscription): Promise<boolean> {
    return this.dialogsService.openDialog(CancelSubscriptionDialogComponent, { subscription });
  }

  /**
   * ASk user for subscription reactivation.
   */
  protected askForReactivateSubscription(): Promise<boolean> {
    return this.dialogsService.showConfirmationDialog({
      title: 'Reactivate Subscription',
      message: 'The current subscription will be reactivated',
    });
  }

  /**
   * On reactivate current subscription clicked.
   */
  public onReactivateClicked(): void {
    from(this.askForReactivateSubscription())
      .pipe(
        switchMap(isConfirmed => {
          if (!isConfirmed) {
            return EMPTY;
          }
          this.isBusy$.next(true);
          return this.paymentService.reactivateCurrentSubscription();
        }),
      )
      .subscribe(() => this.isBusy$.next(false));
  }

  private createCanCancelStream(currentProfile$: Observable<jls.PaymentProfile>): Observable<boolean> {
    return currentProfile$
      .pipe(
        map(profile => {
          if (profile == null) {
            return false;
          }
          const { subscription, nextSubscription } = profile;
          // If there is no subscription then nothing to cancel.
          if (subscription == null) {
            return false;
          }
          // If next subscription exists then can cancel.
          if (nextSubscription != null) {
            return true;
          }
          // Otherwise can cancel if it has not been canceled yet and it's active.
          return !subscription.cancelAtPeriodEnd && subscription.isActive;
        }),
      );
  }

  private createCanReactivateStream(currentProfile$: Observable<jls.PaymentProfile>): Observable<boolean> {
    return currentProfile$
      .pipe(
        map(profile => {
          if (profile == null) {
            return false;
          }
          const { subscription, nextSubscription } = profile;
          // Nothing to reactivate.
          if (subscription == null) {
            return false;
          }
          // Can not reactivate subscription when a user requested changing of a plan.
          if (subscription != null && nextSubscription != null) {
            return false;
          }
          // Can reactivate if it is canceled and it's active.
          return subscription.cancelAtPeriodEnd && subscription.isActive;
        }),
      );
  }

  private createCanEditStream(currentProfile$: Observable<jls.PaymentProfile>): Observable<boolean> {
    return currentProfile$.pipe(
      map(({ subscription }) => {
        return subscription.isActive && !subscription.cancelAtPeriodEnd;
      }),
    );
  }
}

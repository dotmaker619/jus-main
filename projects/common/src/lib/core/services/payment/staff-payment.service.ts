import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError, OperatorFunction, timer } from 'rxjs';
import { first, switchMap, mapTo, switchMapTo, retry } from 'rxjs/operators';

import { JusLawPayments } from '../../models/payments';
import { Staff } from '../../models/staff';
import { AppConfigService } from '../app-config.service';
import { CurrentUserService } from '../current-user.service';
import { StripeService } from '../stripe.service';

import { PaymentService } from './payment-service';

/** Staff payment service. */
@Injectable({ providedIn: 'root' })
export class StaffPaymentService extends PaymentService {

  /** Current staff user. */
  private readonly currentStaff$: Observable<Staff>;

  /**
   * @constructor
   * @param httpClient Http client.
   * @param appConfig App config.
   * @param currentUserService Current user service.
   * @param stripeService Stripe service.
   */
  public constructor(
    httpClient: HttpClient,
    appConfig: AppConfigService,
    private readonly currentUserService: CurrentUserService,
    private readonly stripeService: StripeService,
  ) {
    super(httpClient, appConfig);
    this.currentStaff$ = currentUserService.getCurrentStaff();
  }

  /** Get payment info and start payment session. */
  public startPaymentSession(): Observable<JusLawPayments.PaymentInfo> {
    return this.currentStaff$.pipe(
      first(),
      switchMap(user =>
        super.startPaymentSession(
          user.id, JusLawPayments.PaymentType.StaffFee)),
    );
  }

  /**
   * Pay for staff functionality and close payment session.
   * @param paymentInfo Payment info.
   * @param paymentMethodId Payment method.
   */
  public finishPayment(
    { paymentSecret }: JusLawPayments.PaymentInfo,
    paymentMethodId: string,
  ): Observable<void> {
    return of(null).pipe(
      switchMap(() => this.stripeService.confirmPayment(
        paymentSecret.clientSecret,
        paymentMethodId,
      )),
      this.checkStaffFeePaid(),
    );
  }

  /**
   * Throws if staff fee is not paid after specified number of time.
   * @param retryTimes Number of times to retry check.
   * @param retryDelay Delay before retrying the request.
   */
  private checkStaffFeePaid(
    retryTimes: number = 10,
    retryDelay: number = 3000,
  ): OperatorFunction<void, void> {
    const paymentNotReceivedError$ = timer(retryDelay).pipe(
      switchMapTo(throwError(new Error('Payment, has not succeeded yet, please update page later'))),
    );

    const checkUser$ = this.currentUserService.getStaffUser().pipe(
      switchMap(({ isPaid }) => {
        return isPaid ? of(isPaid) : paymentNotReceivedError$;
      }),
      // In case payment is not received, retry request several times
      retry(retryTimes),
    );

    return (source$) => source$.pipe(
      switchMapTo(checkUser$),
      mapTo(void 0),
    );
  }
}

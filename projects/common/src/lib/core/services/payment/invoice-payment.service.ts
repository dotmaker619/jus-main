import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, mapTo, retry, switchMap, switchMapTo } from 'rxjs/operators';

import { JusLawPayments } from '../../models/payments';
import { AppConfigService } from '../app-config.service';
import { InvoiceService } from '../invoice.service';
import { StripeService } from '../stripe.service';

import { PaymentService } from './payment-service';

const STATUS_NOT_UPDATED_YET_MESSAGE = 'Payment is not proceeded yet, please update the page after some time';

/** Invoice payment service. */
@Injectable({ providedIn: 'root' })
export class InvoicePaymentService extends PaymentService {

  /**
   * @constructor
   * @param httpClient Http client.
   * @param appConfig App config.
   */
  public constructor(
    httpClient: HttpClient,
    appConfig: AppConfigService,
    private readonly stripeService: StripeService,
    private readonly invoiceService: InvoiceService,
  ) {
    super(httpClient, appConfig);
  }

  /**
   * Pay for invoice.
   * @param id Id of an invoice.
   * @param paymentMethodId Id of prepared payment method.
   */
  public payForInvoice(id: number, paymentMethodId: string): Observable<void> {
    const retryNumber = 5;
    const retryDelay = 3000;
    const errorWithDelay$ = of(null).pipe(
      delay(retryDelay),
      switchMapTo(throwError(new Error(STATUS_NOT_UPDATED_YET_MESSAGE))));
    const checkInvoicePaid$ = this.invoiceService.getInvoiceById(id).pipe(
      switchMap(({ isPaid }) => isPaid ? of(null) : errorWithDelay$),
      retry(retryNumber),
    );

    return super.startPaymentSession(
      id, JusLawPayments.PaymentType.InvoicePayment,
    ).pipe(
      switchMap(({ paymentSecret }) =>
        this.stripeService.confirmPayment(
          paymentSecret.clientSecret,
          paymentMethodId,
        )),
      switchMapTo(checkInvoicePaid$),
      mapTo(void 0),
    );
  }
}

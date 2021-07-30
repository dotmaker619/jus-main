import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { PaymentActionDto } from '../../dto/payment-action-dto';
import { PaymentInfoDto } from '../../dto/payment-info-dto';
import { JusLawPayments } from '../../models/payments';
import { AppConfigService } from '../app-config.service';

/** Abstract payment service. */
export abstract class PaymentService {
  private readonly paymentUrl: string;

  /**
   * @constructor
   * @param httpClient Http client.
   * @param appConfig App config.
   */
  public constructor(
    private readonly httpClient: HttpClient,
    appConfig: AppConfigService,
  ) {
    this.paymentUrl = new URL('finance/payments', appConfig.apiUrl).toString();
  }

  /**
   * Start payment session.
   * @param id Object id.
   * @param objectType Type of an object with which payment is connected.
   */
  protected startPaymentSession(
    id: number, objectType: JusLawPayments.PaymentType,
  ): Observable<JusLawPayments.PaymentInfo> {
    const body = {
      object_id: id,
      object_type: objectType,
    } as PaymentActionDto;
    return this.httpClient.post<PaymentInfoDto>(`${this.paymentUrl}/start/`, body).pipe(
      map(this.mapPaymentInfoFromDto),
    );
  }

  /**
   * Cancel payment session.
   * @param id Id of a payment session.
   */
  public cancelPayment(id: number): Observable<void> {
    return this.httpClient.post<void>(`${this.paymentUrl}/${id}/cancel/`, null).pipe(
      // Even if request didn't work, backend would close it after timeout anyway
      catchError(() => of(null)),
    );
  }

  private mapPaymentInfoFromDto(this: void, dto: PaymentInfoDto): JusLawPayments.PaymentInfo {
    return {
      amount: dto.amount,
      description: dto.description,
      id: dto.id,
      payerId: dto.payer,
      paymentSecret: {
        clientSecret: dto.payment_object_data.client_secret,
        status: dto.payment_object_data.status,
      },
      recipientId: dto.recipient,
      status: dto.status,
    };
  }
}

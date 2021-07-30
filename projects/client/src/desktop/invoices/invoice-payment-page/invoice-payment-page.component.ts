import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { BaseInvoicePaymentPage } from '@jl/client/shared/base/invoice-payment-page.base';
import { TimeBillingService } from '@jl/common/core/services/attorney/time-billing.service';
import { InvoiceService } from '@jl/common/core/services/invoice.service';
import { InvoicePaymentService } from '@jl/common/core/services/payment/invoice-payment.service';
import { DialogsService } from '@jl/common/shared';
import { Observable } from 'rxjs';
import { take, switchMap } from 'rxjs/operators';

/**
 * Page to make an invoice payment.
 */
@Component({
  selector: 'jlcl-invoice-payment-page',
  templateUrl: './invoice-payment-page.component.html',
  styleUrls: ['./invoice-payment-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoicePaymentPageComponent extends BaseInvoicePaymentPage {
  /**
   * @constructor
   *
   * @param route Route
   * @param paymentService Payment service.
   * @param invoiceService Invoice service.
   * @param timeBillingService Time billing service.
   * @param dialogsService Dialogs service.
   */
  public constructor(
    route: ActivatedRoute,
    paymentService: InvoicePaymentService,
    invoiceService: InvoiceService,
    timeBillingService: TimeBillingService,
    private readonly dialogsService: DialogsService,
  ) {
    super(route, paymentService, invoiceService, timeBillingService);
  }

  /** @inheritdoc */
  protected notify(message: string, title: string): Promise<void> {
    return this.dialogsService.showInformationDialog({
      message, title,
    });
  }
}

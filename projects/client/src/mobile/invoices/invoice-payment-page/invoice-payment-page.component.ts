import { Component, ChangeDetectionStrategy, ViewChild, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { BaseInvoicePaymentPage } from '@jl/client/shared/base/invoice-payment-page.base';
import { TimeBillingService } from '@jl/common/core/services/attorney/time-billing.service';
import { InvoiceService } from '@jl/common/core/services/invoice.service';
import { InvoicePaymentService } from '@jl/common/core/services/payment/invoice-payment.service';
import { AlertService } from '@jl/common/mobile/services/alert.service';
import { PaymentMethodFormComponent } from '@jl/common/shared/components/payment-method-form/payment-method-form.component';
import { filter, take } from 'rxjs/operators';

/**
 * Invoice payment page.
 */
@Component({
  selector: 'jlcl-invoice-payment-page',
  templateUrl: './invoice-payment-page.component.html',
  styleUrls: ['./invoice-payment-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoicePaymentPageComponent extends BaseInvoicePaymentPage implements OnInit {

  /** Payment method form. */
  @ViewChild(PaymentMethodFormComponent, { static: false })
  public readonly paymentMethodForm: PaymentMethodFormComponent;

  /**
   * @constructor
   *
   * @param route Route
   * @param paymentService Payment service.
   * @param invoiceService Invoice service.
   * @param timeBillingService Time billing service.
   * @param navCtrl Nav controller.
   * @param alertService Alert service.
   */
  public constructor(
    route: ActivatedRoute,
    paymentService: InvoicePaymentService,
    invoiceService: InvoiceService,
    timeBillingService: TimeBillingService,
    private readonly navCtrl: NavController,
    private readonly alertService: AlertService,
  ) {
    super(route, paymentService, invoiceService, timeBillingService);
  }

  /** @inheritdoc */
  public ngOnInit(): void {
    const finished$ = this.viewState$.pipe(
      filter(val => val === this.PaymentViewState.Finished),
      take(1),
    );

    finished$.subscribe(() => this.finishPayment());
  }

  /** @inheritdoc */
  protected notify(message: string, title: string): Promise<void> {
    return this.alertService.showNotificationAlert({
      header: title,
      message,
    });
  }

  private async finishPayment(): Promise<void> {
    await this.alertService.showNotificationAlert({
      buttonText: 'OK',
      header: 'Payment Submitted',
      message: 'Your payment has been successfully submitted.',
    });
    this.navCtrl.back();
  }
}

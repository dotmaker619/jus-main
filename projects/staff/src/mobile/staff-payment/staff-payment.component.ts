import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@jl/common/core/services/auth.service';
import { StaffPaymentService } from '@jl/common/core/services/payment/staff-payment.service';
import { AlertService } from '@jl/common/mobile/services/alert.service';
import { StaffPaymentBase } from '@jl/staffshared/base/staff-payments.base';

/** Staff payment page. */
@Component({
  selector: 'jlst-staff-payment',
  templateUrl: './staff-payment.component.html',
  styleUrls: ['./staff-payment.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StaffPaymentComponent extends StaffPaymentBase {

  /**
   * @constructor
   * @param staffPaymentService Staff payment service.
   * @param authService Auth service.
   * @param stripeService Stripe service.
   * @param router Router.
   */
  public constructor(
    staffPaymentService: StaffPaymentService,
    authService: AuthService,
    router: Router,
    private readonly alertService: AlertService,
  ) {
    super(
      staffPaymentService,
      authService,
      router,
    );
  }

  /** @inheritdoc */
  protected notifySuccessfulPayment(message: string, title: string): Promise<void> {
    return this.alertService.showNotificationAlert({
      header: title,
      message,
    });
  }

  /** @inheritdoc */
  protected notifyAboutError(message: string, title: string): Promise<void> {
    return this.alertService.showNotificationAlert({
      header: title,
      message,
    });
  }

}

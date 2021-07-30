import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@jl/common/core/services/auth.service';
import { StaffPaymentService } from '@jl/common/core/services/payment/staff-payment.service';
import { DialogsService } from '@jl/common/shared';

import { StaffPaymentBase } from '../../shared/base/staff-payments.base';

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
    private readonly dialogsService: DialogsService,
  ) {
    super(
      staffPaymentService,
      authService,
      router,
    );
  }

  /** Notify user payment is successful. */
  protected notifySuccessfulPayment(): Promise<void> {
    return this.dialogsService.showSuccessDialog({
      title: 'One Time Payment Complete!',
      message: 'Thank you! Now you can freely use all Paralegal functionality',
    });
  }

  /** Notify user about unsuccessful payment procedure. */
  protected notifyAboutError(
    message: string,
    title: string = 'Something is not right',
  ): Promise<void> {
    return this.dialogsService.showInformationDialog({
      title,
      message,
    });
  }
}

import { Component, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Attorney } from '@jl/common/core/models/attorney';
import { AttorneyRegistration } from '@jl/common/core/models/attorney-registration';
import { JusLawSubscriptions } from '@jl/common/core/models/subscriptions';
import { catchValidationError } from '@jl/common/core/rxjs';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { RegistrationService } from '@jl/common/core/services/registration.service';
import { SubscriptionService } from '@jl/common/core/services/subscription.service';
import { AlertService } from '@jl/common/mobile/services/alert.service';
import { PaymentMethodFormComponent } from '@jl/common/shared/components/payment-method-form/payment-method-form.component';
import { SelectPaymentPlanFormComponent } from '@jl/common/shared/components/select-payment-plan-form/select-payment-plan-form.component';
import {
  ACCOUNT_CREATED_TITLE, ATTORNEY_ACCOUNT_CREATED_MESSAGE,
} from '@jl/common/shared/modules/registration/registration-constants';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { first, switchMap, map, shareReplay } from 'rxjs/operators';

import { RegistrationStepMergerService } from '../../../services/registration-step-merger.service';

/** Third step page in attorney registration. */
@Component({
  selector: 'jlc-attorney-third-step-registration',
  templateUrl: './attorney-third-step-registration.component.html',
  styleUrls: ['./attorney-third-step-registration.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttorneyThirdStepRegistrationComponent {
  /** Is app loading. */
  public readonly isLoading$ = new BehaviorSubject<boolean>(false);

  /** Available payment plans. */
  public readonly paymentPlans$: Observable<JusLawSubscriptions.PaymentPlan[]>;

  /** Payment method form. */
  @ViewChild(PaymentMethodFormComponent, { static: false })
  public readonly paymentMethodForm: PaymentMethodFormComponent;

  /** Payment plan form. */
  @ViewChild(SelectPaymentPlanFormComponent, { static: false })
  public readonly selectPaymentPlanForm: SelectPaymentPlanFormComponent;

  /**
   * @constructor
   * @param paymentService Payment service.
   * @param registrationMerger Registration merger
   * @param registrationService Registration service.
   * @param navController Router.
   */
  public constructor(
    private readonly paymentService: SubscriptionService,
    private readonly registrationMerger: RegistrationStepMergerService<AttorneyRegistration>,
    private readonly registrationService: RegistrationService,
    private readonly alertService: AlertService,
    private readonly navController: NavController,
  ) {
    this.paymentPlans$ = this.paymentService.getPaymentPlans();
  }

  /**
   * Handle form submission.
   * @param form Form.
   */
  public onSubmit(): void {
    this.paymentMethodForm.markAsTouched();
    const isValid = this.paymentMethodForm.valid && this.selectPaymentPlanForm.valid;
    if (!isValid || this.isLoading$.value) {
      return;
    }
    this.isLoading$.next(true);
    const paymentData$ = combineLatest([
      this.paymentMethodForm.formSubmit.asObservable(),
      this.selectPaymentPlanForm.formSubmit.asObservable(),
    ]).pipe(
      map(([paymentMethod, paymentPlan]) => ({
        paymentMethod,
        paymentPlan: paymentPlan.id,
      } as Pick<Attorney, 'paymentMethod' | 'paymentPlan'>)),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );

    combineLatest([
      this.registrationMerger.getRegistrationData(),
      paymentData$,
    ]).pipe(
      first(),
      switchMap(
        ([attorneyData, paymentData]) =>
          this.registrationService.registerAttorney(
            new AttorneyRegistration({
              ...attorneyData,
              ...paymentData,
            }),
            // Since it is a registration we know for sure these are files
            attorneyData.attachedFiles as File[],
          ),
      ),
      onMessageOrFailed(() => this.isLoading$.next(false)),
      switchMap(() => this.alertService.showNotificationAlert({
        header: ACCOUNT_CREATED_TITLE,
        message: ATTORNEY_ACCOUNT_CREATED_MESSAGE,
      })),
      switchMap(() => this.navController.navigateRoot('/')),
      catchValidationError(() => {
        return this.alertService.showNotificationAlert({
          header: 'Unexpected error',
          message: 'Please, proceed the steps from the beginning',
        });
      }),
    ).subscribe();

    this.paymentMethodForm.submit();
    this.selectPaymentPlanForm.submit();
  }
}

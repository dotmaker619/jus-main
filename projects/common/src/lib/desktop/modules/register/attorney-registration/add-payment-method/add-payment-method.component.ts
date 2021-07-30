import { Component, ChangeDetectionStrategy, ViewChild, EventEmitter, OnDestroy, Output, Input } from '@angular/core';
import { AttorneyRegistration } from '@jl/common/core/models/attorney-registration';
import { JusLawSubscriptions as jls } from '@jl/common/core/models/subscriptions';
import { SubscriptionService } from '@jl/common/core/services/subscription.service';
import { PaymentMethodFormComponent } from '@jl/common/shared/components/payment-method-form/payment-method-form.component';
import { SelectPaymentPlanFormComponent } from '@jl/common/shared/components/select-payment-plan-form/select-payment-plan-form.component';
import { Observable, combineLatest, BehaviorSubject, Subject, EMPTY } from 'rxjs';
import { share, map, startWith, shareReplay, takeUntil, catchError, first } from 'rxjs/operators';

/**
 * Component for the third step of attorney registration.
 */
@Component({
  selector: 'jlc-add-payment-method',
  templateUrl: './add-payment-method.component.html',
  styleUrls: ['./add-payment-method.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddPaymentMethodComponent implements OnDestroy {
  private isPaymentMethodFormComponentReady$ = new BehaviorSubject<boolean>(false);
  private selectedPlan$ = new Subject<jls.PaymentPlan>();
  private selectedPaymentMethod$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  /**
   * Attorney registration data.
   */
  @Input()
  public registrationData: AttorneyRegistration;

  /**
   * Form submit event.
   */
  @Output()
  public formSubmit = new EventEmitter<AttorneyRegistration>();

  /**
   * Cancel current step event.
   */
  @Output()
  public cancel = new EventEmitter<void>();

  /**
   * Cancel current step event.
   */
  @Output()
  public back = new EventEmitter<void>();

  /**
   * Credit card component.
   */
  @ViewChild(PaymentMethodFormComponent, { static: true })
  public paymentMethodFormComponent: PaymentMethodFormComponent;

  /**
   * Select payment plan form control.
   */
  @ViewChild(SelectPaymentPlanFormComponent, { static: true })
  public selectPaymentPlanFormControl: SelectPaymentPlanFormComponent;

  /**
   * Available payment plans.
   */
  public readonly paymentPlans$: Observable<jls.PaymentPlan[]>;

  /**
   * Is all components are ready to use.
   */
  public readonly isAllComponentsAreReady$: Observable<boolean>;

  /**
   * Is submitting in progress.
   */
  public readonly isSubmitting$ = new BehaviorSubject<boolean>(false);

  /**
   * @constructor
   *
   * @param paymentService Payment service.
   */
  public constructor(
    private paymentService: SubscriptionService,
  ) {
    this.paymentPlans$ = this.paymentService.getPaymentPlans()
      .pipe(share());

    this.isAllComponentsAreReady$ = combineLatest([
      this.paymentPlans$,
      this.isPaymentMethodFormComponentReady$,
    ])
      .pipe(
        map(([plans, isPaymentFormComponentReady]) => plans != null && isPaymentFormComponentReady),
        startWith(false),
        shareReplay({ bufferSize: 1, refCount: true }),
      );
  }

  /**
   * @inheritdoc
   */
  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * On credit card component is ready to work.
   */
  public onPaymentMethodFormComponentIsReady(): void {
    this.isPaymentMethodFormComponentReady$.next(true);
  }

  /**
   * On submit button clicked.
   */
  public onSubmitClicked(): void {
    this.paymentMethodFormComponent.markAsTouched();
    const isFormsValid = this.paymentMethodFormComponent.valid && this.selectPaymentPlanFormControl.valid;

    if (!isFormsValid) {
      return;
    }
    this.isSubmitting$.next(true);
    /**
     * Subscribe to submit events of forms and submit and emit submission event of the current component.
     * Wait values from both forms.
     */
    // Re-create Subjects because they could contains an error.
    // TODO: Improve this part.
    this.selectedPlan$ = new Subject<jls.PaymentPlan>();
    this.selectedPaymentMethod$ = new Subject<string>();
    combineLatest(this.selectedPaymentMethod$, this.selectedPlan$)
      .pipe(
        map(([paymentMethod, paymentPlan]) => ({ paymentMethod, paymentPlan })),
        first(),
        catchError(() => {
          this.isSubmitting$.next(false);
          return EMPTY; // Complete if submit error occurred.
        }),
        takeUntil(this.destroy$),
      )
      .subscribe(({ paymentMethod, paymentPlan }) => {
        this.registrationData.paymentMethod = paymentMethod;
        this.registrationData.paymentPlan = paymentPlan.id;
        this.formSubmit.emit(this.registrationData);
        this.isSubmitting$.next(false);
      });
    this.paymentMethodFormComponent.submit();
    this.selectPaymentPlanFormControl.submit();
  }

  /**
   * On credit card submitted submitted.
   *
   * @param paymentMethod Selected payment method.
   */
  public onPaymentMethodSubmitted(paymentMethod: string): void {
    this.selectedPaymentMethod$.next(paymentMethod);
  }

  /**
   * On credit card submit failed.
   */
  public onPaymentMethodSubmitFailed(error: string): void {
    this.selectedPaymentMethod$.error(error);
  }

  /**
   * On selected payment method submitted.
   *
   * @param paymentPlan Selected payment plan.
   */
  public onSelectPaymentPlanFormSubmitted(paymentPlan: jls.PaymentPlan): void {
    this.selectedPlan$.next(paymentPlan);
  }

  /**
   * On "Cancel" button clicked.
   */
  public onCancelClicked(): void {
    this.cancel.next();
  }

  /**
   * On "Back" button clicked.
   */
  public onBackClicked(): void {
    this.back.emit();
  }
}

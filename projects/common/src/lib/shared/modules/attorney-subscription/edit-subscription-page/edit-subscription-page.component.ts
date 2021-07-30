import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SubscriptionChangePreview } from '@jl/common/core/models/subscription-change-preview';
import { JusLawSubscriptions as jls } from '@jl/common/core/models/subscriptions';
import { SubscriptionService } from '@jl/common/core/services/subscription.service';
import { DialogsService } from '@jl/common/shared';
import { UPGRADE_PLAN_TEXT, DOWNGRADE_PLAN_TEXT } from '@jl/common/shared/constants/subscription-constants';
import { Observable, combineLatest, BehaviorSubject, of, from, EMPTY } from 'rxjs';
import { first, map, shareReplay, switchMap, startWith } from 'rxjs/operators';

import {
  ChangeSubscriptionPlanDialogComponent,
} from '../components/change-subscription-plan-dialog/change-subscription-plan-dialog.component';

/** Edit subscription page component */
@Component({
  selector: 'jlc-edit-subscription-page',
  templateUrl: './edit-subscription-page.component.html',
  styleUrls: ['./edit-subscription-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditSubscriptionPageComponent {
  private readonly currentPaymentProfile$: Observable<jls.PaymentProfile>;

  /**
   * Form control.
   */
  public readonly form$: Observable<FormGroup>;

  /**
   * Available payment plans
   */
  public readonly availablePaymentPlans$: Observable<jls.PaymentPlan[]>;

  /**
   * Is form submitting.
   */
  public isSubmitting$ = new BehaviorSubject(false);

  /**
   * Is plan changed.
   */
  public readonly isPlanTheSame$: Observable<boolean>;

  /**
   * @constructor
   * @param dialogsService Dialogs service.
   * @param paymentService Payment service.
   * @param formBuilder Form builder service.
   * @param router Router.
   */
  public constructor(
    protected readonly dialogsService: DialogsService,
    protected readonly paymentService: SubscriptionService,
    protected readonly formBuilder: FormBuilder,
    protected readonly router: Router,
  ) {
    this.availablePaymentPlans$ = this.paymentService.getPaymentPlans()
      .pipe(
        shareReplay({
          bufferSize: 1,
          refCount: true,
        }),
      );
    this.currentPaymentProfile$ = this.paymentService.getCurrentProfile()
      .pipe(
        shareReplay({
          bufferSize: 1,
          refCount: true,
        }),
      );
    this.form$ = this.createFormStream();

    this.isPlanTheSame$ = this.form$
      .pipe(
        switchMap(form => form.valueChanges.pipe(startWith(form.value))),
        map(formValues => formValues.initPlan === formValues.paymentPlan),
      );
  }

  /** On submit */
  public onFormSubmitted(form: FormGroup): void {
    form.markAllAsTouched();
    if (form.invalid || this.isSubmitting$.value) {
      return;
    }

    this.isSubmitting$.next(true);
    combineLatest(this.availablePaymentPlans$, this.currentPaymentProfile$)
      .pipe(
        first(),
        switchMap(([plans, currentProfile]) => {
          // If this is changing of current plan, then get a user confirmation.
          const nextPlan = plans.find(plan => plan.id === form.value.paymentPlan);
          return this.getUserConfirmation(currentProfile, nextPlan)
            .pipe(
              switchMap(isConfirmed => {
                if (!isConfirmed) {
                  return EMPTY;
                }
                this.isSubmitting$.next(true);
                return this.paymentService.updatePaymentPlan(nextPlan).pipe(first());
              }),
            );
        }),
      )
      .subscribe(
        () => this.router.navigate(['/subscription']),
        error => {
          this.isSubmitting$.next(false);
          throw error;
        },
      );
  }

  private getUserConfirmation(currentProfile: jls.PaymentProfile, nextPlan: jls.PaymentPlan): Observable<boolean> {
    const currentSubscription = currentProfile.subscription;
    if (currentSubscription == null) {
      // This is buying of new subscription. No need to display some confirmation.
      return of(true);
    }

    this.isSubmitting$.next(true);
    const changePreview$ = this.paymentService.getChangePlanPreview(nextPlan);

    return changePreview$
      .pipe(
        switchMap(changePreview => {
          this.isSubmitting$.next(false);
          if (changePreview.isUpgrade) {
            return from(this.askUserForUpgrade(changePreview));
          }
          return from(this.askUserForDowngrade(changePreview));
        }),
      );
  }

  /**
   * Ask user for a upgrade change.
   * @param changePreview Change preview.
   */
  protected askUserForUpgrade(changePreview: SubscriptionChangePreview): Promise<boolean> {
    return this.dialogsService.openDialog(ChangeSubscriptionPlanDialogComponent, {
      textTemplate: UPGRADE_PLAN_TEXT,
      changePreview,
    }) as Promise<boolean>;
  }

  /**
   * Ask user for a downgrade change.
   * @param changePreview Change preview.
   */
  protected askUserForDowngrade(changePreview: SubscriptionChangePreview): Promise<boolean> {
    return this.dialogsService.openDialog(ChangeSubscriptionPlanDialogComponent, {
      textTemplate: DOWNGRADE_PLAN_TEXT,
      changePreview,
    }) as Promise<boolean>;
  }

  /**
   * Track plan by ID.
   * @param plan Payment plan.
   */
  public trackPlanById(_: number, plan: jls.PaymentPlan): string {
    return plan.id;
  }

  private createFormStream(): Observable<FormGroup> {
    // Combine with available plans to init form after all data loaded.
    return combineLatest(this.currentPaymentProfile$, this.availablePaymentPlans$)
      .pipe(
        first(),
        map(([paymentProfile]) => {
          const currentPlanId = paymentProfile.subscription
            ? paymentProfile.subscription.plan.id
            : null;
          return this.formBuilder.group({
            initPlan: [currentPlanId], // To disable submit button if a user selected the same plan.
            paymentPlan: [currentPlanId, Validators.required],
          });
        }),
        shareReplay({
          refCount: true,
          bufferSize: 1,
        }),
      );
  }
}

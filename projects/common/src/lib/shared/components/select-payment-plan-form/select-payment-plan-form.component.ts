import { Component, ChangeDetectionStrategy, Input, OnChanges, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { JusLawSubscriptions } from '@jl/common/core/models/subscriptions';

const { PaymentPlan } = JusLawSubscriptions;
type PaymentPlan = JusLawSubscriptions.PaymentPlan;

type SelectPaymentPlanValue = PaymentPlan | PaymentPlan['id'];

/**
 * Select payment plan form.
 */
@Component({
  selector: 'jlc-select-payment-plan-form',
  templateUrl: './select-payment-plan-form.component.html',
  styleUrls: ['./select-payment-plan-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectPaymentPlanFormComponent implements OnChanges {
  /**
   * Available payment plans.
   */
  @Input()
  public paymentPlans: PaymentPlan[];

  /**
   * Init selected payment plan.
   */
  @Input()
  public initPaymentPlan?: SelectPaymentPlanValue;

  /**
   * Form submit event.
   */
  @Output()
  public readonly formSubmit = new EventEmitter<PaymentPlan>();

  /**
   * Form control.
   */
  public readonly form: FormGroup;

  /**
   * @constructor
   * @param formBuilder Form builder.
   */
  public constructor(
    private readonly formBuilder: FormBuilder,
  ) {
    this.form = this.createForm();
  }

  private createForm(): FormGroup {
    return this.formBuilder.group({
      paymentPlan: [null, Validators.required],
    });
  }

  /**
   * @inheritdoc
   */
  public ngOnChanges(changes: SimpleChanges): void {
    if ('paymentPlans' in changes || 'initPaymentPlan' in changes) {
      this.updateSelectedPlanIfNotFilled();
    }
  }

  private updateSelectedPlanIfNotFilled(): void {
    if (this.paymentPlans == null || this.paymentPlans.length === 0) {
      return;
    }
    const paymentPlanControl = this.form.get('paymentPlan') as FormControl;
    if (paymentPlanControl.value == null) {
      this.setPaymentPlan(this.initPaymentPlan);
    }
  }

  private setPaymentPlan(plan: SelectPaymentPlanValue): void {
    if (this.paymentPlans == null) {
      return;
    }
    const paymentPlanControl = this.form.get('paymentPlan') as FormControl;
    const planId = plan instanceof PaymentPlan
      ? plan.id
      : plan;
    const selectedPaymentPlan = this.paymentPlans.find(p => p.id === planId) || this.paymentPlans[0];
    paymentPlanControl.setValue(selectedPaymentPlan.id);
  }

  /**
   * Submit changes.
   */
  public submit(): void {
    this.form.updateValueAndValidity();
    if (this.form.invalid) {
      return;
    }
    const paymentPlan = this.paymentPlans.find(plan => plan.id === this.form.value.paymentPlan);
    this.formSubmit.emit(paymentPlan);
  }

  /**
   * Is form component valid.
   */
  public get valid(): boolean {
    return this.form.valid;
  }
}

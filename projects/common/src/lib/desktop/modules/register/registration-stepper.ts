import { TEntityValidationErrors } from '@jl/common/core/models/api-error';
import { Observable, BehaviorSubject } from 'rxjs';

/**
 * Registration step info.
 * T - model of registration data.
 */
export interface RegistrationStep<T> {
  /**
   * Title.
   */
  title: string;
  /**
   * Identifier.
   */
  id: number;
  /**
   * Fields of current step to detect what step to display when API returns error.
   */
  fields: (keyof T)[];
}

/**
 * Registration stepper.
 */
export class RegistrationStepper<T> {
  private readonly currentStepValue$: BehaviorSubject<RegistrationStep<T>>;

  /**
   * @constructor
   * @param steps List of steps.
   * @param initStep Step to set as current on init.
   */
  public constructor(steps: RegistrationStep<T>[], initStep: number = 0) {
    this.steps = steps;
    this.currentStepValue$ = new BehaviorSubject(steps[initStep]);
    this.currentStep$ = this.currentStepValue$.asObservable();
  }

  /**
   * Steps list.
   */
  public readonly steps: RegistrationStep<T>[];

  /**
   * Current step.
   */
  public readonly currentStep$: Observable<RegistrationStep<T>>;

  /**
   * Go to next step.
   */
  public goToNextStep(): void {
    const currentStepIndex = this.steps.indexOf(this.currentStepValue$.value);
    const nextStep = this.steps[currentStepIndex + 1];
    if (nextStep == null) {
      console.warn('This is the last step. Can not go to the next step.');
      return;
    }
    this.currentStepValue$.next(nextStep);
  }

  /**
   * Go to previous step.
   */
  public goToPrevStep(): void {
    const currentStepIndex = this.steps.indexOf(this.currentStepValue$.value);
    const prevStep = this.steps[currentStepIndex - 1];
    if (prevStep == null) {
      console.warn('This is the first step. Can not go to previous step.');
      return;
    }
    this.currentStepValue$.next(prevStep);
  }

  /**
   * Set current step.
   * @param step Step.
   */
  public setCurrentStep(step: RegistrationStep<T>): void {
    if (!this.steps.includes(step)) {
      throw new Error('Stepper does not have such step.');
    }
    this.currentStepValue$.next(step);
  }

  /**
   * Go to a step with specific field.
   * If a step with certain field is not found then will be used a step with empty fields list.
   * @param field Target field.
   */
  public goToStepWithField(...field: (keyof T)[]): RegistrationStep<T> {
    const step = this.getStepWithField(...field);
    this.currentStepValue$.next(step);
    return step;
  }

  /**
   * Go to a step that contains first field with error.
   * @param errors Validation errors.
   */
  public goToStepWithError(errors: TEntityValidationErrors<T>): RegistrationStep<T> {
    const fields = Object.keys(errors).filter(field => errors[field] != null) as (keyof T)[];
    return this.goToStepWithField(...fields);
  }

  /**
   * Get a step with specific field.
   * If a step with certain field is not found then will be used a step with empty fields list.
   * @param fields Target field(s).
   */
  public getStepWithField(...fields: (keyof T)[]): RegistrationStep<T> {
    const fieldsSet = new Set(fields);
    const resultStep = this.steps.find(step => step.fields.some(stepField => fieldsSet.has(stepField)));
    if (resultStep != null) {
      return resultStep;
    }
    return this.steps.find(step => step.fields.length === 0);
  }
}

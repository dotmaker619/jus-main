import { Component, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { ApiValidationError, TEntityValidationErrors } from '@jl/common/core/models/api-error';
import { Attorney } from '@jl/common/core/models/attorney';
import { AttorneyRegistration } from '@jl/common/core/models/attorney-registration';
import { JusLawFile } from '@jl/common/core/models/juslaw-file';
import { catchValidationError } from '@jl/common/core/rxjs';
import { RegistrationService } from '@jl/common/core/services/registration.service';
import { DialogsService } from '@jl/common/shared';
import {
  INITIAL_ATTORNEY_REGISTRATION_DATA,
  ACCOUNT_CREATED_TITLE,
  ATTORNEY_ACCOUNT_CREATED_MESSAGE,
} from '@jl/common/shared/modules/registration/registration-constants';
import { BehaviorSubject, EMPTY, Observable } from 'rxjs';
import { finalize, switchMap, first, filter, switchMapTo, tap } from 'rxjs/operators';

import { RegistrationStep, RegistrationStepper } from '../registration-stepper';

type AttorneyRegistrationStep = RegistrationStep<AttorneyRegistration>;

const STEPS: AttorneyRegistrationStep[] = [
  {
    id: 1,
    title: 'Step 1 - Create an Account',
    fields: [
      'email',
      'password',
      'passwordRepeat',
    ],
  },
  {
    id: 2,
    title: 'Step 2 - Verify Attorney Information',
    fields: [],
  },
  {
    id: 3,
    title: 'Step 3 - Subscription & Payment Information',
    fields: [
      'paymentPlan',
      'paymentMethod',
    ],
  },
];

/**
 * Registration component page.
 */
@Component({
  selector: 'jlc-attorney-registration',
  templateUrl: './attorney-registration.component.html',
  styleUrls: ['./attorney-registration.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttorneyRegistrationComponent {

  private readonly stepper = new RegistrationStepper<AttorneyRegistration>(STEPS);

  /**
   * Registration data.
   */
  public registrationData: AttorneyRegistration = INITIAL_ATTORNEY_REGISTRATION_DATA;

  /**
   * Validation error.
   */
  public validationError$ = new BehaviorSubject<TEntityValidationErrors<AttorneyRegistration>>(null);

  /**
   * Is submitting in progress.
   */
  public readonly isSubmitting$ = new BehaviorSubject<boolean>(false);

  /**
   * Current step.
   */
  public currentStep$: Observable<AttorneyRegistrationStep> = this.stepper.currentStep$;

  /**
   * Can deactivate component.
   */
  public canDeactivate = true;

  /**
   * Files attached to a registration.
   */
  public attachedDocs: JusLawFile<File>[] = [];

  /**
   * @constructor
   *
   * @param registrationService Registration service.
   * @param dialogService Dialog service.
   * @param router Router.
   */
  public constructor(
    private registrationService: RegistrationService,
    private dialogService: DialogsService,
    private router: Router,
  ) {
    this.registrationData = INITIAL_ATTORNEY_REGISTRATION_DATA;
  }

  /**
   * Listen `beforeunload` event.
   */
  @HostListener('window:beforeunload', ['$event'])
  public unloadNotification($event: BeforeUnloadEvent): void {
    if (!this.canDeactivate) {
      $event.preventDefault();
      $event.returnValue = true;
    }
  }

  /**
   * Add data from first step.
   */
  public onCreateAccountSubmitted(data: AttorneyRegistration): void {
    this.registrationData = new AttorneyRegistration({ ...this.registrationData, ...data });

    this.isSubmitting$.pipe(
      first(),
      filter(isSubmitting => !isSubmitting),
      tap(() => this.isSubmitting$.next(true)),
      switchMapTo(this.registrationService.validateAttorneyRegistrationStep(this.registrationData, 'first')),
      finalize(() => this.isSubmitting$.next(false)),
    ).subscribe(this.validate);
  }

  /**
   * Add data from second step.
   */
  public onAdditionalInfoSubmitted(data: Attorney): void {
    this.registrationData = new AttorneyRegistration({ ...this.registrationData, ...data });

    this.isSubmitting$.pipe(
      first(),
      filter(isSubmitting => !isSubmitting),
      tap(() => this.isSubmitting$.next(true)),
      switchMapTo(this.registrationService.validateAttorneyRegistrationStep(this.registrationData, 'second')),
      finalize(() => this.isSubmitting$.next(false)),
    ).subscribe(this.validate);
  }

  private validate = (error: ApiValidationError<AttorneyRegistration>) => {
    if (error != null) {
      this.dialogService.showInformationDialog({ title: 'Registration error', message: error.message });
      const { validationData } = error;
      this.validationError$.next(validationData);
    } else {
      this.validationError$.next(null);
      this.stepper.goToNextStep();
    }
  }
  /**
   * On payment stage submitted.
   *
   * @param data Updated registration data.
   */
  public onPaymentSubmitted(data: AttorneyRegistration): void {
    this.registrationData = data;
    this.isSubmitting$.next(true);
    this.registrationService.registerAttorney(this.registrationData, this.attachedDocs.map(doc => doc.file)).pipe(
      catchValidationError((error: ApiValidationError<AttorneyRegistration>) => {
        this.dialogService.showInformationDialog({ title: 'Registration error', message: error.message });
        const { validationData } = error;
        this.validationError$.next(validationData);
        // Redirect to a step that contains errors.
        this.stepper.goToStepWithError(validationData);
        return EMPTY;
      }),
      switchMap(() => {
        // Done.
        this.canDeactivate = true;
        this.dialogService.showSuccessDialog({
          title: ACCOUNT_CREATED_TITLE,
          message: ATTORNEY_ACCOUNT_CREATED_MESSAGE,
        }).then(() => this.navigateToHome());
        // Return EMPTY to finalize loading.
        return EMPTY;
      }),
      finalize(() => this.isSubmitting$.next(false)),
    ).subscribe();
  }

  /**
   * On current step cancelled.
   */
  public onCurrentStepCancelled(): void {
    this.navigateToHome();
  }

  /**
   * On back current step requested.
   */
  public onBackCurrentStep(data?: Attorney): void {
    // Save data on back click.
    if (data != null) {
      this.registrationData = new AttorneyRegistration({ ...this.registrationData, ...data });
    }

    this.stepper.goToPrevStep();
  }

  private navigateToHome(): Promise<boolean> {
    return this.router.navigate(['/']);
  }

  /**
   * Present errors to a user.
   *
   * @param errors Errors.
   */
  public onFileDropErrors(errors: string[]): void {
    this.dialogService.showInformationDialog({
      title: 'Couldn\'t upload a file',
      message: errors.join('\n'),
    });
  }
}

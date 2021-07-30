import { Location } from '@angular/common';
import { Component, ChangeDetectionStrategy, OnInit, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DestroyableBase } from '@jl/common/core';
import { ClientRegistration, Client } from '@jl/common/core/models';
import { TEntityValidationErrors } from '@jl/common/core/models/api-error';
import { Login } from '@jl/common/core/models/login';
import { catchValidationError } from '@jl/common/core/rxjs';
import { InvitesService } from '@jl/common/core/services/attorney/invites.service';
import { AuthService } from '@jl/common/core/services/auth.service';
import { RegistrationService } from '@jl/common/core/services/registration.service';
import { DialogsService } from '@jl/common/shared';
import { BehaviorSubject, Observable, EMPTY, of } from 'rxjs';
import { switchMap, mapTo, first, tap, finalize, takeUntil, catchError } from 'rxjs/operators';

import { RegistrationStepper, RegistrationStep } from '../registration-stepper';

const STEPS: RegistrationStep<ClientRegistration>[] = [
  {
    id: 1,
    title: 'Step 1 - Create an Account',
    fields: [
      'firstName',
      'lastName',
      'email',
      'password',
      'passwordConfirm',
    ],
  },
  {
    id: 2,
    title: 'Step 2 - Additional Information',
    fields: [], // Rest.
  },
];

const INITIAL_REGISTRATION_DATA = null;

const ACCOUNT_CREATED_DIALOG_INFO = {
  title: 'Account Created!',
  message: 'Start browsing our forums, post questions, and search our Attorney database!',
};

/**
 * Client registration page.
 */
@Component({
  selector: 'jlc-client-registration',
  templateUrl: './client-registration.component.html',
  styleUrls: ['./client-registration.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientRegistrationComponent extends DestroyableBase implements OnInit {

  private readonly stepper = new RegistrationStepper<ClientRegistration>(STEPS);

  /**
   * Current registration step.
   */
  public readonly currentStep$ = this.stepper.currentStep$;

  /**
   * Is submitting in progress.
   */
  public readonly isSubmitting$ = new BehaviorSubject<boolean>(false);

  /**
   * API validation errors.
   */
  public readonly validationError$ = new BehaviorSubject<TEntityValidationErrors<ClientRegistration>>(null);

  /**
   * Registration data.
   */
  public registrationData$ = new BehaviorSubject<ClientRegistration>(INITIAL_REGISTRATION_DATA);

  /**
   * Can deactivate component.
   */
  public canDeactivate = true;

  /**
   * @constructor
   *
   * @param router Router service.
   * @param location Location service.
   * @param activateRoute Activated route.
   * @param invitesService Invites service.
   * @param registrationService Registration service.
   * @param dialogsService Dialogs service.
   * @param authService Auth service.
   */
  public constructor(
    private readonly router: Router,
    private readonly location: Location,
    private readonly activateRoute: ActivatedRoute,
    private readonly invitesService: InvitesService,
    private readonly registrationService: RegistrationService,
    private readonly dialogsService: DialogsService,
    private readonly authService: AuthService,
  ) {
    super();
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
   * @inheritdoc
   */
  public ngOnInit(): void {
    const clientUUID = this.activateRoute.snapshot.queryParamMap.get('invite');

    if (clientUUID) {
      this.isSubmitting$.next(true);
      this.invitesService.getInvitedClient(clientUUID)
        .pipe(
          takeUntil(this.destroy$),
          tap(inviteData => {
            this.registrationData$.next(new ClientRegistration({
              ...this.registrationData$.value,
              firstName: inviteData.firstName,
              lastName: inviteData.lastName,
              email: inviteData.email,
              organizationName: inviteData.organizationName,
              clientType: inviteData.clientType,
            }));
          }),
          finalize(() => this.isSubmitting$.next(false)),
        )
        .subscribe();
    } else {
      this.registrationData$.next(new ClientRegistration({}));
    }
  }

  /**
   * On "Create Account" form submitted.
   *
   * @param accountData Registration data.
   */
  public onCreateAccountSubmitted(accountData: ClientRegistration): void {
    this.registrationData$.next(new ClientRegistration({ ...this.registrationData$.value, ...accountData }));
    this.stepper.goToNextStep();
  }

  /**
   * On "Additional Information" form submitted.
   *
   * @param additionalInfo Registration data.
   */
  public onAdditionalInfoSubmitted(additionalInfo: Client): void {
    const registrationData = new ClientRegistration({ ...this.registrationData$.value, ...additionalInfo });
    this.registrationData$.next(registrationData);
    this.createAccountAndShowResult(registrationData).subscribe();
  }

  private createAccountAndShowResult(registrationData: ClientRegistration): Observable<void> {
    this.isSubmitting$.next(true);
    return this.registrationService.registerClient(registrationData)
      .pipe(
        first(),
        catchValidationError(apiError => {
          this.dialogsService.showInformationDialog({ title: 'Registration error', message: apiError.message });
          const { validationData } = apiError;
          this.validationError$.next(validationData);
          // Redirect to a step that contains errors.
          this.stepper.goToStepWithError(validationData);
          return EMPTY;
        }),
        switchMap(() => {
          // Switch state to prevent displaying of loading indicator over dialog.
          this.isSubmitting$.next(false);
          return this.dialogsService.showSuccessDialog(ACCOUNT_CREATED_DIALOG_INFO);
        }),
        switchMap(() => {
          this.isSubmitting$.next(true);
          const loginData = new Login({
            email: registrationData.email,
            password: registrationData.password,
          });
          return this.authService.login(loginData)
            .pipe(
              catchError(error => {
                // Even if an error occurred we should redirect a user to the dashboard page.
                console.warn('Auto login after registration failed', error);
                return of(null);
              }),
            );
        }),
        tap(() => this.canDeactivate = true),
        switchMap(() => this.router.navigate(['/'])),
        finalize(() => this.isSubmitting$.next(false)),
        mapTo(null),
      );
  }

  /**
   * On current step cancelled.
   */
  public onCurrentStepCancelled(): void {
    this.location.back();
  }

  /**
   * On back current step requested.
   * @param client Entered but not saved data.
   */
  public onBackCurrentStep(additionalInfo?: Client): void {
    // Save data when a user goes to previous step.
    if (additionalInfo != null) {
      const registrationData = new ClientRegistration({ ...this.registrationData$.value, ...additionalInfo });
      this.registrationData$.next(registrationData);
    }
    this.stepper.goToPrevStep();
  }
}

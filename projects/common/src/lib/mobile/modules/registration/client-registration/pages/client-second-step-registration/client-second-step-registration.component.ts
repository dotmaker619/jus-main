import { Component, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { DestroyableBase } from '@jl/common/core';
import { ClientRegistration, Client } from '@jl/common/core/models';
import { ApiError, TEntityValidationErrors, ApiValidationError } from '@jl/common/core/models/api-error';
import { Login } from '@jl/common/core/models/login';
import { catchValidationError } from '@jl/common/core/rxjs';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { AuthService } from '@jl/common/core/services/auth.service';
import { RegistrationService } from '@jl/common/core/services/registration.service';
import { ClientInfoFormComponent } from '@jl/common/mobile/components/client-info-form/client-info-form.component';
import { AlertService } from '@jl/common/mobile/services/alert.service';
import { Observable, of, merge, NEVER, EMPTY, BehaviorSubject } from 'rxjs';
import { first, tap, switchMapTo, map, switchMap, catchError, mapTo, filter, takeUntil, shareReplay, exhaustMap } from 'rxjs/operators';

import { RegistrationStepMergerService } from '../../../services/registration-step-merger.service';
import { ClientFirstStepRegistrationComponent } from '../client-first-step-registration/client-first-step-registration.component';

const SUCCESS_ALERT = {
  header: 'Account Created!',
  message: 'Start browsing our forums, post questions, and search our Attorney database!',
};

/** Page for the second step of client registration. */
@Component({
  selector: 'jlc-client-second-step-registration',
  templateUrl: './client-second-step-registration.component.html',
  styleUrls: ['./client-second-step-registration.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientSecondStepRegistrationComponent extends DestroyableBase {

  /** Loading subject. */
  public readonly isLoading$ = new BehaviorSubject<boolean>(false);

  /** Validation error. */
  public readonly validationError$: Observable<TEntityValidationErrors<ClientRegistration>>;

  /** Second step registration form. */
  public readonly form$: Observable<FormGroup>;

  /** Client info form group. */
  @ViewChild(ClientInfoFormComponent, { static: false })
  public clientInfoFormGroup: ClientInfoFormComponent;

  /**
   * @constructor
   * @param registrationMerger Registration merge service.
   * @param formBuilder Form builder.
   * @param registrationService Rergistration service.
   * @param authService Auth service.
   * @param alertService Alert service.
   * @param activatedRoute Activated route.
   */
  public constructor(
    private readonly registrationMerger: RegistrationStepMergerService<ClientRegistration>,
    private readonly formBuilder: FormBuilder,
    private readonly registrationService: RegistrationService,
    private readonly authService: AuthService,
    private readonly alertService: AlertService,
    private readonly navController: NavController,
    private readonly activatedRoute: ActivatedRoute,
  ) {
    super();
    this.validationError$ = this.registrationMerger.getValidationError();
    this.form$ = this.initFormStream();
  }

  private initFormStream(): Observable<FormGroup> {
    const form = this.formBuilder.group({ client: [] });

    const fillForm$ = this.registrationMerger.getRegistrationData().pipe(
      first(),
      tap(clientData => form.setValue({ client: clientData })),
      switchMapTo(NEVER),
    );

    return merge(of(form), fillForm$).pipe(
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
  }

  /**
   * Presave info before navigating back.
   * @param form Form.
   */
  public presaveAdditionalData(form: FormGroup): void {
    this.registrationMerger.setRegistrationData({
      ...form.value.client,
    });
  }

  /**
   * Submit registration.
   * @param form Form.
   */
  public onSubmit(form: FormGroup): void {
    this.clientInfoFormGroup.markAsTouched();
    if (form.invalid || this.isLoading$.value) {
      return;
    }

    const clientData$ = this.registrationMerger.getRegistrationData().pipe(
      map((data) => ({
        ...data,
        ...form.value.client,
      } as ClientRegistration)),
      first(),
    );

    this.isLoading$.next(true);
    clientData$.pipe(
      switchMap(data =>
        this.registrationService.registerClient(data)),
      onMessageOrFailed(() => this.isLoading$.next(false)),
      switchMap(() => this.alertService.showNotificationAlert(SUCCESS_ALERT)),
      tap(() => this.isLoading$.next(true)),
      switchMapTo(clientData$),
      switchMap((data) => this.login(data)),
      onMessageOrFailed(() => this.isLoading$.next(false)),
      catchValidationError(error => this.handleValidationError(error)),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  private handleValidationError(
    error: ApiValidationError<ClientRegistration>,
  ): Observable<void> {
    const { validationData: errData } = error;
    const firstStepFields = ClientFirstStepRegistrationComponent.fields;

    this.registrationMerger.setValidationError(errData);
    return of(null).pipe(
      switchMap(() => this.alertService.showNotificationAlert({
        header: 'Registration error',
        message: error.message,
      })),
      filter(() =>
        firstStepFields.some(field => errData[field] != null)),
      switchMapTo(this.form$),
      switchMap((form) => {
        this.presaveAdditionalData(form);
        return this.navController.navigateBack(['..'], {
          relativeTo: this.activatedRoute,
        });
      }),
      mapTo(null),
    );
  }

  private login(data: Login): Observable<void> {
    const sendUserToLogin$ = of(null).pipe(
      switchMap(() => this.alertService.showNotificationAlert({
        header: 'Registration successful',
        message: 'Please, procede to the login page',
      })),
      switchMap(() => this.navController.navigateRoot('/auth/login')),
    );

    return this.authService.login(data).pipe(
      switchMap(() => this.navController.navigateRoot('/')),
      catchError(() => sendUserToLogin$),
      mapTo(null),
    );
  }
}

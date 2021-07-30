import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DeactivateFormComponent } from '@jl/common/core/forms/deactivate-form-component';
import { TEntityValidationErrors, ApiValidationError } from '@jl/common/core/models/api-error';
import { StaffRegistration } from '@jl/common/core/models/staff-registration';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { RegistrationService } from '@jl/common/core/services/registration.service';
import { JusLawValidators } from '@jl/common/core/validators/validators';
import { Observable, ReplaySubject, BehaviorSubject, EMPTY, of } from 'rxjs';
import { take, tap, switchMap, catchError } from 'rxjs/operators';

/** Base class for staff registration page. */
export abstract class BaseStaffRegistration implements DeactivateFormComponent {

  /** @inheritdoc */
  public canDeactivate: boolean;

  /** Form group. */
  public readonly form$: Observable<FormGroup>;

  /** Validation errors. */
  public readonly validationError$ = new ReplaySubject<TEntityValidationErrors<unknown>>(1);

  /** Is app loading. */
  public readonly isLoading$ = new BehaviorSubject<boolean>(false);

  /**
   * @constructor
   * @param formBuilder Form builder.
   * @param registrationService Registration service.
   * @param router Router.
   */
  public constructor(
    private readonly formBuilder: FormBuilder,
    private readonly registrationService: RegistrationService,
    private readonly router: Router,
  ) {
    this.form$ = this.initFormStream();
  }

  /** Notify user registration is successful. */
  protected abstract showSuccessDialog(): Promise<void>;

  /**
   * Handles form submission.
   * @param form Form.
   */
  public onSubmit(form: FormGroup): void {
    form.markAllAsTouched();
    if (form.invalid || this.isLoading$.value) {
      return;
    }

    const value = form.value;
    this.isLoading$.next(true);

    this.registrationService.registerStaff(value).pipe(
      take(1),
      onMessageOrFailed(() => this.isLoading$.next(false)),
      tap(() => this.canDeactivate = true),
      switchMap(() => this.showSuccessDialog()),
      switchMap(() => this.router.navigateByUrl('/', {})),
      catchError(({validationData}: ApiValidationError<StaffRegistration>) => {
        this.validationError$.next(validationData);
        return EMPTY;
      }),
    ).subscribe();
  }

  /**
   * On profile image changed.
   *
   * @param form Form control.
   * @param file File with an image.
   */
  public onProfileImageChanged(form: FormGroup, file: File): void {
    const avatarFormControl = form.get('avatar') as FormControl;
    avatarFormControl.setValue(file);
    avatarFormControl.markAsDirty();
  }

  private initFormStream(): Observable<FormGroup> {
    const form = this.formBuilder.group({
      avatar: [null],
      firstName: [null, [Validators.required]],
      lastName: [null, [Validators.required]],
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required]],
      passwordConfirmation: [null, [Validators.required,
        JusLawValidators.matchControl('password', 'Password')]],
      description: [null, [Validators.required]],
    });

    return of(form);
  }
}

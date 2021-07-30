import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import {
  ApiValidationError,
  TEntityValidationErrors,
} from '@jl/common/core/models/api-error';
import { ResetPassword } from '@jl/common/core/models/reset-password';
import { ResetPasswordConfirmation } from '@jl/common/core/models/reset-password-confirmation';
import { catchValidationError } from '@jl/common/core/rxjs';
import { AuthService } from '@jl/common/core/services/auth.service';
import { triggerValidation } from '@jl/common/core/utils/form-trigger';
import { BehaviorSubject, EMPTY } from 'rxjs';
import { take } from 'rxjs/operators';

/** Component for password reset */
@Component({
  selector: 'jlat-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordResetComponent {

  /** Define if request to server return error code */
  public errorMessage$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  /** Validation errors for change password form */
  public validationError$ = new BehaviorSubject<TEntityValidationErrors<ResetPasswordConfirmation>>({});
  /** Fires when reset was successfully performed */
  public isSuccess$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /** Forgot password form */
  public form = this.fb.group({
    email: ['', Validators.required],
  });

  /** Inject form builder and auth service dependencies */
  public constructor(
    private fb: FormBuilder,
    private authService: AuthService,
  ) { }

  /** Set success$ to true to render message */
  private handleSuccessReset(): void {
    this.isSuccess$.next(true);
  }

  /** Set isFailed value to false and clears the from */
  private handleFailedReset(errorMessage: string): void {
    this.form.reset();
    this.errorMessage$.next(errorMessage);
  }

  /** Perform authentication */
  public onFormSubmitted(): void {
    const credentials = new ResetPassword(this.form.value);
    this.form.markAllAsTouched();
    triggerValidation(this.form);
    this.authService.resetPassword(credentials)
      .pipe(
        take(1),
        catchValidationError((error: ApiValidationError<ResetPasswordConfirmation>) => {
          const { validationData } = error;
          this.validationError$.next(validationData);
          return EMPTY;
        }),
      )
      .subscribe(
        () => this.handleSuccessReset(),
        (message) => this.handleFailedReset(message),
      );
  }
}

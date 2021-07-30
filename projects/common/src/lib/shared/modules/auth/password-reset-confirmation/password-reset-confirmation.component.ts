import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ApiValidationError,
  TEntityValidationErrors,
} from '@jl/common/core/models/api-error';
import { ResetPasswordConfirmation } from '@jl/common/core/models/reset-password-confirmation';
import { catchValidationError } from '@jl/common/core/rxjs';
import { AuthService } from '@jl/common/core/services/auth.service';
import { triggerValidation } from '@jl/common/core/utils/form-trigger';
import { BehaviorSubject, EMPTY } from 'rxjs';
import { take } from 'rxjs/operators';

/** Component to perform password change after password reset action */
@Component({
  selector: 'jlc-password-reset-confirmation',
  templateUrl: './password-reset-confirmation.component.html',
  styleUrls: ['./password-reset-confirmation.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordResetConfirmationComponent implements OnInit {
  /** Define if password change was failed */
  public errorMessage$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  /** Validation errors for change password form */
  public validationError$ = new BehaviorSubject<TEntityValidationErrors<ResetPasswordConfirmation>>({});
  /** Reset password from */
  public form = this.fb.group({
    password1: ['', Validators.required],
    password2: ['', Validators.required],
    resetPasswordToken: [''],
  });
  private resetPasswordToken: string;

  /**
   * @constructor
   * @param fb - form builder instance
   * @param router - router instance
   * @param authService - service for user authentication
   * @param activatedRoute - current app route
   */
  public constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
  ) { }

  /** Set isFailed value to false */
  private handleFailedPasswordChange(errorMessage: string): void {
    this.errorMessage$.next(errorMessage);
  }

  /** Navigate user to login page */
  private handleSuccessPasswordChange(): void {
    this.router.navigate(['auth/login/']);
  }

  /** Perform password change action */
  public onFormSubmitted(): void {
    const data: Partial<ResetPasswordConfirmation> = this.form.value;
    data.resetPasswordToken = this.resetPasswordToken;
    this.form.markAllAsTouched();
    triggerValidation(this.form);
    this.authService.resetPasswordConfirmation(new ResetPasswordConfirmation(data))
      .pipe(
        take(1),
        catchValidationError((error: ApiValidationError<ResetPasswordConfirmation>) => {
          const { validationData } = error;
          this.validationError$.next(validationData);
          return EMPTY;
        }),
      )
      .subscribe(
        () => this.handleSuccessPasswordChange(),
        (message) => this.handleFailedPasswordChange(message),
      );
  }

  /** Gather password change key from query params
   *
   * In case there is no query params in route, navigate user to login page.
   *
   * */
  public ngOnInit(): void {
    const key = this.activatedRoute.snapshot.queryParams['key'];

    if (!key) {
      this.router.navigate(['auth/login/']);
    }

    this.resetPasswordToken = key;
  }

}

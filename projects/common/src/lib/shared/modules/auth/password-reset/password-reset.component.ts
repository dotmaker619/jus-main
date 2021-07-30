import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ResetPassword } from '@jl/common/core/models/reset-password';
import { AuthService } from '@jl/common/core/services/auth.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { take } from 'rxjs/operators';

/** Component for password reset */
@Component({
  selector: 'jlc-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordResetComponent {

  /** Define if request to server return error code */
  public errorMessage$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  /** Fires when reset was successfully performed */
  public isSuccess$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /** Forgot password form */
  public form = this.fb.group({
    email: ['', Validators.required],
  });

  /**
   * @constructor
   * @param fb - Form builder instance
   * @param authService - service for user authentication
   */
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
    this.authService.resetPassword(credentials)
      .pipe(
        take(1),
      )
      .subscribe(
        () => this.handleSuccessReset(),
        (message) => this.handleFailedReset(message),
      );
  }
}

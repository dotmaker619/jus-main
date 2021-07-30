import { Component, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { JusLawValidators } from '@jl/common/core/validators/validators';
import { BehaviorSubject } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';

/**
 * Change password form component.
 */
@Component({
  selector: 'jlc-change-password-form',
  templateUrl: './change-password-form.component.html',
  styleUrls: ['./change-password-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangePasswordFormComponent {

  /**
   * Password change event emitter.
   */
  @Output()
  public passwordChange = new EventEmitter<void>();

  /**
   * "Cancel" event emitter.
   */
  @Output()
  public cancel = new EventEmitter<void>();

  /**
   * Error of password change.
   */
  public error$ = new BehaviorSubject<Error | null>(null);

  /**
   * Form control.
   */
  public readonly form: FormGroup;

  /**
   * @constructor
   *
   * @param formBuilder Form builder.
   * @param userService User service.
   */
  public constructor(
    private formBuilder: FormBuilder,
    private userService: CurrentUserService,
  ) {
    this.form = this.formBuilder.group({
      currentPassword: [null, Validators.required],
      newPassword: [null, [Validators.required, Validators.minLength(8)]],
      confirmPassword: [null, [Validators.required, JusLawValidators.matchControl('newPassword', 'New password')]],
    });
  }

  /**
   * On form submitted.
   *
   * @param form Form control.
   */
  public onFormSubmitted(form: FormGroup): void {
    form.markAllAsTouched();
    if (form.invalid) {
      return;
    }
    this.userService.changePassword(this.form.value.currentPassword, this.form.value.newPassword)
      .pipe(
        takeUntil(this.cancel),
        first(),
      )
      .subscribe(
        () => this.passwordChange.emit(),
        error => this.error$.next(error),
      );
  }

  /**
   * On "Cancel" button click.
   */
  public onCancelClicked(): void {
    this.cancel.emit();
  }

}

import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { BehaviorSubject } from 'rxjs';
import { first, switchMap } from 'rxjs/operators';

import { AlertService } from '../../services/alert.service';

/**
 * Account info page for mobile workspace.
 */
@Component({
  selector: 'jlc-mobile-change-password-modal',
  templateUrl: './mobile-change-password-modal.component.html',
  styleUrls: ['./mobile-change-password-modal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileChangePasswordModalComponent {

  /**
   * Is app loading.
   */
  public readonly isLoading$ = new BehaviorSubject<boolean>(false);

  /**
   * Form group.
   */
  public readonly form: FormGroup;
  /**
   * URL for 'eye' icon.
   */
  public readonly eyeIconUrl = '/assets/icons/eye-outline.svg';
  /**
   * URL for 'eye-off' icon.
   */
  public readonly eyeOffIconUrl = '/assets/icons/eye-off-outline.svg';
  /**
   * Control visibility of the current password field.
   */
  public isCurrentPasswordVisible = false;
  /**
   * Control visibility of the new password field.
   */
  public isNewPasswordVisible = false;
  /**
   * Error of password change.
   */
  public readonly error$ = new BehaviorSubject<Error | null>(null);

  /**
   * @constructor
   *
   * @param modalCtrl Modal controller.
   * @param fb Form builder.
   * @param userService User service.
   * @param alertService Alert service.
   */
  public constructor(
    private readonly modalCtrl: ModalController,
    private readonly fb: FormBuilder,
    private readonly userService: CurrentUserService,
    private readonly alertService: AlertService,
  ) {
    this.form = this.initForm();
  }

  /**
   * On form submitted.
   *
   * @param form Form group.
   */
  public onFormSubmitted(form: FormGroup): void {
    form.markAllAsTouched();
    if (form.invalid) {
      return;
    }
    this.isLoading$.next(true);
    this.userService.changePassword(this.form.value.currentPassword, this.form.value.newPassword)
      .pipe(
        first(),
        onMessageOrFailed(() => this.isLoading$.next(false)),
        switchMap(() => this.alertService.showNotificationAlert({
          header: 'Password Changed',
        })),
      )
      .subscribe(
        () => this.close(),
        error => this.error$.next(error),
      );
  }

  /**
   * Toggle new password field visibility.
   */
  public toggleNewPasswordVisibility(): void {
    this.isNewPasswordVisible = !this.isNewPasswordVisible;
  }

  /**
   * Toggle current password visibility.
   */
  public toggleCurrentPasswordVisibility(): void {
    this.isCurrentPasswordVisible = !this.isCurrentPasswordVisible;
  }

  private initForm(): FormGroup {
    return this.fb.group({
      currentPassword: [null, Validators.required],
      newPassword: [null, [Validators.required, Validators.minLength(8)]],
    });
  }

  /**
   * Close modal.
   */
  public close(): void {
    this.modalCtrl.dismiss();
  }
}

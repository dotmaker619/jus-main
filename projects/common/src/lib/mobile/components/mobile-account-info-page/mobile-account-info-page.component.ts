import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { User } from '@jl/common/core/models/user';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { ESignService } from '@jl/common/core/services/esign.service';
import {
  MobileChangePasswordModalComponent,
} from '@jl/common/mobile/modals/mobile-change-password-form/mobile-change-password-modal.component';
import { AlertService } from '@jl/common/mobile/services/alert.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, filter, switchMapTo, tap, first } from 'rxjs/operators';

/**
 * Account info page for mobile workspace.
 */
@Component({
  selector: 'jlc-mobile-account-info-page',
  templateUrl: './mobile-account-info-page.component.html',
  styleUrls: ['./mobile-account-info-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileAccountInfoComponent {
  /**
   * Form group.
   */
  public readonly form$: Observable<FormGroup>;
  /**
   * Loading controller.
   */
  public readonly isLoading$ = new BehaviorSubject<boolean>(false);
  /**
   * Is consent for docusign provided.
   */
  public readonly isConsentProvided$ = this.esignService.isConsentProvided();

  /**
   * @constructor
   *
   * @param userService User service.
   * @param fb Form builder.
   * @param modalCtrl Modal controller.
   * @param alertService Alert service.
   * @param esignService ESign service.
   */
  public constructor(
    private readonly userService: CurrentUserService,
    private readonly fb: FormBuilder,
    private readonly modalCtrl: ModalController,
    private readonly alertService: AlertService,
    private readonly esignService: ESignService,
  ) {
    this.form$ = this.initFormStream();
    this.isConsentProvided$ = this.esignService.isConsentProvided();
  }

  /**
   * On "Change password" clicked.
   */
  public async onChangePasswordClicked(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: MobileChangePasswordModalComponent,
      animated: true,
      cssClass: 'custom-action-sheet',
    });
    modal.present();
  }

  /**
   * Reset docusign account on button click.
   */
  public async onResetDocusign(): Promise<void> {
    this.alertService.showConfirmation({
      buttonText: 'Reset',
      cancelButtonText: 'Cancel',
      header: 'Reset Docusign Account',
      message: 'Are you sure you want to reset ESign account?',
      isDangerous: true,
    }).pipe(
      first(),
      filter((hasPermissionToReset) => hasPermissionToReset),
      tap(() => this.isLoading$.next(true)),
      switchMapTo(this.esignService.resetEsignProfile().pipe(first())),
      onMessageOrFailed(() => this.isLoading$.next(false)),
    ).subscribe(() => this.alertService.showNotificationAlert({
      buttonText: 'OK',
      header: 'Success!',
      message: 'ESign account has been reset',
    }));
  }

  private createForm(user: User): FormGroup {
    return this.fb.group({
      firstName: [{ value: user.firstName, disabled: true }],
      lastName: [{ value: user.lastName, disabled: true }],
      email: [{ value: user.email, disabled: true }],
    });
  }

  private initFormStream(): Observable<FormGroup> {
    return this.userService.currentUser$
      .pipe(
        filter(user => user != null),
        map((user) => this.createForm(user)),
      );
  }
}

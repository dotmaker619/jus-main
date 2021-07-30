import { Component, ChangeDetectionStrategy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { User } from '@jl/common/core/models/user';
import { ESignService } from '@jl/common/core/services/esign.service';
import { BehaviorSubject } from 'rxjs';
import { first, finalize, tap } from 'rxjs/operators';

import { DialogsService } from '../../modules/dialogs/dialogs.service';
import { ChangePasswordDialogComponent } from '../change-password-dialog/change-password-dialog.component';

const SUCCESS_DIALOG_INFO = {
  title: 'Password change successfully',
  message: '',
};

/**
 * Account info component.
 */
@Component({
  selector: 'jlc-account-info',
  templateUrl: './account-info.component.html',
  styleUrls: ['./account-info.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountInfoComponent implements OnChanges {
  /** Is loading. */
  public isLoading$ = new BehaviorSubject<boolean>(false);
  /**
   * User to display.
   */
  @Input()
  public user: User;

  /**
   * Form control.
   */
  public form: FormGroup;

  /**
    * Is consent for docusign provided.
    */
  public readonly isConsentProvided$ = this.esignService.isConsentProvided();

  /**
   * @constructor
   *
   * @param formBuilder Form builder.
   * @param dialogsService Dialogs service.
   * @param esignService Esign service.
   */
  public constructor(
    private readonly formBuilder: FormBuilder,
    private readonly dialogsService: DialogsService,
    private readonly esignService: ESignService,
  ) {
  }

  /**
   * @inheritdoc
   */
  public ngOnChanges(changes: SimpleChanges): void {
    if ('user' in changes && this.user != null) {
      this.form = this.createForm(this.user);
    }
  }

  /**
   * On "Change password" clicked.
   */
  public onChangePasswordClicked(): void {
    this.dialogsService.openDialog(ChangePasswordDialogComponent)
      .then((result: boolean) => result && this.dialogsService.showSuccessDialog(SUCCESS_DIALOG_INFO));
  }

  private createForm(user: User): FormGroup {
    return this.formBuilder.group({
      firstName: [user.firstName],
      lastName: [user.lastName],
      email: [user.email],
    });
  }

  /**
   * Reset docusign account on button click.
   */
  public async onResetDocusignClicked(): Promise<void> {
    const hasPermissionToReset = await this.dialogsService.showConfirmationDialog({
      confirmationButtonClass: 'danger',
      cancelButtonText: 'Cancel',
      confirmationButtonText: 'Reset',
      message: 'Are you sure you want to reset ESign account?',
      title: 'Reset Docusign Account',
    });

    if (hasPermissionToReset) {
      this.isLoading$.next(true);

      this.esignService.resetEsignProfile().pipe(
        first(),
        tap(() => {
          this.dialogsService.showSuccessDialog({
            title: 'Success!',
            message: 'ESign account has been reset',
          });
        }),
        finalize(() => this.isLoading$.next(false)),
      ).subscribe();
    }
  }

  /**
   * Allow DocuSign.
   */
  public isDocuSignAllowed(): boolean {
    return this.user.role !== 'client';
  }
}

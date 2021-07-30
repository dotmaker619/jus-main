import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Client, ClientType } from '@jl/common/core/models/client';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { DialogsService } from '@jl/common/shared';
import { ChangePasswordDialogComponent } from '@jl/common/shared/components/change-password-dialog/change-password-dialog.component';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const SUCCESS_DIALOG_INFO = {
  title: 'Password change successfully',
  message: '',
};

/**
 * Client account page.
 */
@Component({
  selector: 'jlcl-client-info-page',
  templateUrl: './client-info-page.component.html',
  styleUrls: ['./client-info-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientInfoPageComponent {
  /**
   * Current user info.
   */
  public readonly form$: Observable<FormGroup>;

  /**
   * Client type options.
   */
  public clientTypeOptions = ClientType;

  /**
   * @constructor
   *
   * @param userService User service.
   * @param formBuilder Form builder.
   * @param dialogsService Dialogs service.
   */
  public constructor(
    private readonly userService: CurrentUserService,
    private readonly formBuilder: FormBuilder,
    private readonly dialogsService: DialogsService,
  ) {
    this.form$ = this.initFormStream();
  }

  private initFormStream(): Observable<FormGroup> {
    return this.userService.getCurrentClient().pipe(
      map(client => this.createFormForClient(client)),
    );
  }

  private createFormForClient(client: Client): FormGroup {
    const form = this.formBuilder.group({
      firstName: [{
        value: client.firstName,
        disabled: true,
      }],
      lastName: [{
        value: client.lastName,
        disabled: true,
      }],
      email: [{
        value: client.email,
        disabled: true,
      }],
      clientType: [{
        value: client.clientType,
        disabled: true,
      }],
    });

    if (client.clientType === ClientType.Organization) {
      form.addControl('organizationName', new FormControl({
        value: client.organizationName,
        disabled: true,
      }));
    }
    return form;
  }

  /**
   * On "Change password" clicked.
   */
  public onChangePasswordClicked(): void {
    this.dialogsService.openDialog(ChangePasswordDialogComponent)
      .then((result: boolean) => result && this.dialogsService.showSuccessDialog(SUCCESS_DIALOG_INFO));
  }
}

import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { RegistrationService } from '@jl/common/core/services/registration.service';
import { DialogsService } from '@jl/common/shared';
import { BaseStaffRegistration } from '@jl/common/shared/base-components/registration/staff-registration.base';
import { ACCOUNT_CREATED_TITLE, STAFF_ACCOUNT_CREATED_MESSAGE } from '@jl/common/shared/modules/registration/registration-constants';

/** Staff registration page. */
@Component({
  selector: 'jlc-staff-registration',
  templateUrl: './staff-registration.component.html',
  styleUrls: ['./staff-registration.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StaffRegistrationComponent extends BaseStaffRegistration  {

  /**
   * @constructor
   * @param formBuilder Form builder.
   * @param registrationService Registration service.
   * @param router Router.
   * @param dialogService Dialog service.
   */
  public constructor(
    formBuilder: FormBuilder,
    registrationService: RegistrationService,
    router: Router,
    private readonly dialogService: DialogsService,
  ) {
    super(
      formBuilder,
      registrationService,
      router,
    );
  }

  /** @inheritdoc */
  protected showSuccessDialog(): Promise<void>  {
    return this.dialogService.showSuccessDialog({
      title: ACCOUNT_CREATED_TITLE,
      message: STAFF_ACCOUNT_CREATED_MESSAGE,
    });
  }
}

import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Pagination } from '@jl/common/core/models/pagination';
import { Role } from '@jl/common/core/models/role';
import { User } from '@jl/common/core/models/user';
import { MattersService } from '@jl/common/core/services/attorney/matters.service';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { StaffService } from '@jl/common/core/services/staff.service';
import { AlertService } from '@jl/common/mobile/services/alert.service';
import { Observable } from 'rxjs';

import { BaseReferMatterModal } from '../refer-matter-modal.base';

/**
 * Modal window to add support to a matter.
 */
@Component({
  selector: 'jlc-add-support-modal',
  templateUrl: './add-support-modal.component.html',
  styleUrls: ['./add-support-modal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddSupportModalComponent extends BaseReferMatterModal {
  /** @inheritdoc */
  public constructor(
    fb: FormBuilder,
    modalCtrl: ModalController,
    alertService: AlertService,
    mattersService: MattersService,
    userService: CurrentUserService,
    private readonly staffService: StaffService,
  ) {
    super(
      fb,
      modalCtrl,
      alertService,
      mattersService,
      userService,
      Role.Staff,
    );
  }

  /** @inheritdoc */
  protected searchUsers(page: number, query: string): Observable<Pagination<User>> {
    return this.staffService.getStaff({ page: page, search: query });
  }
}

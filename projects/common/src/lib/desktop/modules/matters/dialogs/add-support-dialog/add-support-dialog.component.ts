import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Pagination } from '@jl/common/core/models/pagination';
import { Role } from '@jl/common/core/models/role';
import { User } from '@jl/common/core/models/user';
import { MattersService } from '@jl/common/core/services/attorney/matters.service';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { StaffService } from '@jl/common/core/services/staff.service';
import { DialogsService } from '@jl/common/shared';
import { Observable } from 'rxjs';

import { BaseReferMatterDialog } from '../refer-matter-dialog.base';

/**
 * Dialog window to add supports to the matter.
 */
@Component({
  selector: 'jlc-add-support-dialog',
  templateUrl: './add-support-dialog.component.html',
  styleUrls: ['./add-support-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddSupportDialogComponent extends BaseReferMatterDialog {
  /**
   * @constructor
   *
   * @param fb Form builder.
   * @param mattersService Matters service.
   * @param dialogsService Dialogs service.
   * @param userService Current user service.
   * @param staffService Staff service.
   */
  public constructor(
    fb: FormBuilder,
    mattersService: MattersService,
    dialogsService: DialogsService,
    userService: CurrentUserService,
    private readonly staffService: StaffService,
  ) {
    super(fb, mattersService, dialogsService, userService, Role.Staff);
  }

  /** @inheritdoc */
  public searchUsers(page: number, query: string): Observable<Pagination<User>> {
    return this.staffService.getStaff({ page: page, search: query });
  }
}

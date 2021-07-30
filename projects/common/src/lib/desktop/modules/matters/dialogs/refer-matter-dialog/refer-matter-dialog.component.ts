import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Pagination } from '@jl/common/core/models/pagination';
import { Role } from '@jl/common/core/models/role';
import { User } from '@jl/common/core/models/user';
import { MattersService } from '@jl/common/core/services/attorney/matters.service';
import { AttorneysService } from '@jl/common/core/services/attorneys.service';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { DialogsService } from '@jl/common/shared';
import { Observable } from 'rxjs';

import { BaseReferMatterDialog } from '../refer-matter-dialog.base';

/**
 * Dialog window to refer matter with attorneys
 */
@Component({
  selector: 'jlc-refer-matter-dialog',
  templateUrl: './refer-matter-dialog.component.html',
  styleUrls: ['./refer-matter-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReferMatterDialogComponent extends BaseReferMatterDialog {
  /**
   * @inheritdoc
   * @param attorneysService Attorneys service.
   */
  public constructor(
    fb: FormBuilder,
    mattersService: MattersService,
    dialogsService: DialogsService,
    userService: CurrentUserService,
    private readonly attorneysService: AttorneysService,
  ) {
    super(fb, mattersService, dialogsService, userService, Role.Attorney);
  }

  /**
   * Search users
   */
  public searchUsers(page: number, query: string): Observable<Pagination<User>> {
    return this.attorneysService.searchForAttorney({ query, page });
  }
}

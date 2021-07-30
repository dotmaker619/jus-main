import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Pagination } from '@jl/common/core/models/pagination';
import { Role } from '@jl/common/core/models/role';
import { User } from '@jl/common/core/models/user';
import { MattersService } from '@jl/common/core/services/attorney/matters.service';
import { AttorneysService } from '@jl/common/core/services/attorneys.service';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { AlertService } from '@jl/common/mobile/services/alert.service';
import { Observable } from 'rxjs';

import { BaseReferMatterModal } from '../refer-matter-modal.base';

/**
 * Modal window to refer matter with attorneys
 */
@Component({
  selector: 'jlc-refer-matter-modal',
  templateUrl: './refer-matter-modal.component.html',
  styleUrls: ['./refer-matter-modal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReferMatterModalComponent extends BaseReferMatterModal {

  /** @inheritdoc */
  public constructor(
    fb: FormBuilder,
    modalCtrl: ModalController,
    alertService: AlertService,
    mattersService: MattersService,
    userService: CurrentUserService,
    private readonly attorneysService: AttorneysService,
  ) {
    super(
      fb,
      modalCtrl,
      alertService,
      mattersService,
      userService,
      Role.Attorney,
    );
  }

  /** @inheritdoc */
  protected searchUsers(page: number, query: string): Observable<Pagination<User>> {
    return this.attorneysService.searchForAttorney({ query, page });
  }
}

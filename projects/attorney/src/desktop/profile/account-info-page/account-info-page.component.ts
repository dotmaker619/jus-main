import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { User } from '@jl/common/core/models/user';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { Observable } from 'rxjs';

/**
 * Account info component.
 */
@Component({
  selector: 'jlat-account-info-page',
  templateUrl: './account-info-page.component.html',
  styleUrls: ['./account-info-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountInfoComponent {
  /**
   * Current user info.
   */
  public readonly currentUser$: Observable<User>;

  /**
   * @constructor
   */
  public constructor(
    private userService: CurrentUserService,
  ) {
    this.currentUser$ = this.userService.currentUser$;
  }

  /**
   * On "Change password" clicked.
   */
  public onChangePasswordClicked(attorney: User): void {

  }
}

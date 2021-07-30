import { Component, ChangeDetectionStrategy } from '@angular/core';
import { User } from '@jl/common/core/models/user';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { Observable } from 'rxjs';

/**
 * Account information component.
 */
@Component({
  selector: 'jlst-account-info',
  templateUrl: './account-info.component.html',
  styleUrls: ['./account-info.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountInfoComponent {
  /** Current user. */
  public readonly currentUser$: Observable<User>;

  public constructor(
    userService: CurrentUserService,
  ) {
    this.currentUser$ = userService.currentUser$;
  }
}

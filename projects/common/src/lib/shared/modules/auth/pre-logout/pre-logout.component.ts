import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@jl/common/core/services/auth.service';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { Observable, EMPTY, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

/** Authorization guard page. If user proceeded to login page and she is authorized, this page is loaded. */
@Component({
  selector: 'jlc-pre-logout',
  templateUrl: './pre-logout.component.html',
  styleUrls: ['./pre-logout.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreLogoutComponent {

  /** Current user name. */
  public readonly currentName$: Observable<string>;

  /**
   * @constructor
   * @param authService
   * @param currentUserService
   * @param router
   */
  public constructor(
    public readonly authService: AuthService,
    private readonly currentUserService: CurrentUserService,
    private readonly router: Router,
  ) {
    this.currentName$ = this.currentUserService.currentUser$.pipe(
      switchMap(user => {
        if (user == null) {
          this.router.navigateByUrl('/auth');
          return EMPTY;
        }
        return of(user);
      }),
      map(user => user.fullName),
    );
  }

}

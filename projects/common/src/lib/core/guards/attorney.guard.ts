import {Injectable} from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import {Role} from '@jl/common/core/models/role';
import {AuthService} from '@jl/common/core/services/auth.service';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

/** Guard to prevent all users except attorneys to access certain routes. */
@Injectable({
  providedIn: 'root',
})
export class AttorneyGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    ) {}

  /** Determine if rout could be achieved.
   *
   * In case of client user role, redirect to fallback page.
   *
   */
  public canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean| UrlTree> {
    return  this.authService.userType$
      .pipe(
        map(role => {
          if (role === Role.Client) {
            return this.router.parseUrl('/auth/client-fallback');
          }
          return Role.Attorney === role;
        }),

      );
  }
}

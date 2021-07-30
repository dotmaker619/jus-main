import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Role } from '@jl/common/core/models/role';
import { AuthService } from '@jl/common/core/services/auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Guard to redirect an Attorney user to `/attorney` route.
 */
@Injectable({
  providedIn: 'root',
})
export class RedirectForAttorneyGuard implements CanActivate {
constructor(
    private authService: AuthService,
    private router: Router,
    ) {}

  /** Determine if rout could be achieved.
   *
   * In case of attorney user role, redirect to fallback page.
   *
   */
  public canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean| UrlTree> {
    return this.authService.userType$
      .pipe(
        map(role => {
          if (role === Role.Attorney) {
            return this.router.parseUrl('/attorney');
          }
          return true;
        }),
      );
  }
}

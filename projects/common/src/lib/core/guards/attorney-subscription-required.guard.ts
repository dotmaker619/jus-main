import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanLoad,
  CanActivateChild,
  RouterStateSnapshot,
  ActivatedRouteSnapshot,
  UrlTree,
  Route,
  UrlSegment,
  Router,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, switchMap, tap, filter } from 'rxjs/operators';

import { Role } from '../models/role';
import { CurrentUserService } from '../services/current-user.service';

/**
 * Attorney subscription required guard.
 * Doesn't allow access to certain route if current attorney user doesn't have active subscription.
 * Redirects to the "Manage subscription" page if doesn't have.
 */
@Injectable({
  providedIn: 'root',
})
export class AttorneySubscriptionRequiredGuard implements CanActivate, CanLoad, CanActivateChild {
  private readonly redirectToTree: UrlTree;

  /**
   * @constructor
   * @param userService User service.
   * @param router Router.
   */
  public constructor(
    private readonly userService: CurrentUserService,
    private readonly router: Router,
  ) {
    this.redirectToTree = this.router.createUrlTree(['/no-active-subscription']);
  }

  /**
   * @inheritdoc
   */
  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    // Check whether a user has an active subscription and redirect to the certain URL if not.
    return this.hasAttorneyActiveSubscription()
      .pipe(
        map(hasActiveSubscription => {
          if (hasActiveSubscription) {
            return true;
          }
          return this.redirectToTree;
        }),
      );
  }

  /**
   * @inheritdoc
   */
  public canLoad(route: Route, segments: UrlSegment[]): boolean | Observable<boolean> | Promise<boolean> {
    // Check whether a user has an active subscription and redirect to the certain URL if not.
    return this.hasAttorneyActiveSubscription()
      .pipe(
        tap(hasActiveSubscription => {
          if (!hasActiveSubscription) {
            this.router.navigateByUrl(this.redirectToTree);
          }
        }),
      );
  }

  /**
   * @inheritdoc
   */
  public canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return this.canActivate(childRoute, state);
  }

  private hasAttorneyActiveSubscription(): Observable<boolean> {
    return this.userService.currentUser$
      .pipe(
        filter(currentUser => currentUser != null),
        switchMap(currentUser => {
          if (currentUser.role !== Role.Attorney) {
            return of(false);
          }
          return this.userService.getAttorneyUser()
            .pipe(map(attorney => attorney.hasActiveSubscription));
        }),
      );
  }
}

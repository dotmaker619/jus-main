import { Injectable } from '@angular/core';
import { CanLoad, Route, UrlSegment, Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AppConfigService } from '@jl/common/core/services/app-config.service';
import { Observable } from 'rxjs';

/**
 * Subscription module guard.
 */
@Injectable({
  providedIn: 'root',
})
export class SubscriptionModuleGuard implements CanLoad, CanActivate {
  private readonly redirectToUrlTree: UrlTree;

  /**
   * @constructor
   * @param appConfigService App config service.
   * @param router Router.
   */
  public constructor(
    private readonly appConfigService: AppConfigService,
    private readonly router: Router,
  ) {
    this.redirectToUrlTree = this.router.createUrlTree(['/dashboard']);
  }

  /**
   * @inheritdoc
   */
  public canLoad(route: Route, segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean {
    if (!this.appConfigService.isAttorneySubscriptionAllowed) {
      this.router.navigateByUrl(this.redirectToUrlTree);
    }
    return this.appConfigService.isAttorneySubscriptionAllowed;
  }

  /**
   * @inheritdoc
   */
  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): UrlTree | boolean {
    if (this.appConfigService.isAttorneySubscriptionAllowed) {
      return true;
    }
    return this.redirectToUrlTree;
  }
}

import { Injectable } from '@angular/core';
import { CanActivate, CanLoad, UrlTree, Router } from '@angular/router';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

/** Checks whether the user is authorized and if so, redirects on pre-logout page. */
@Injectable({
  providedIn: 'root',
})
export class CanAuthorizeGuard implements CanActivate, CanLoad {
  private readonly preLogoutUrl = this.router.createUrlTree(['/auth', 'pre-logout']);
  private readonly authorized$: Observable<boolean>;

  /**
   * @constructor
   * @param currentUserService Current user service.
   * @param router Router.
   */
  public constructor(
    currentUserService: CurrentUserService,
    private readonly router: Router,
  ) {
    this.authorized$ = currentUserService.currentUser$.pipe(
      map(user => !!user),
    );
  }

  /** Checks whether the auth page may be activated. */
  public canActivate(): Observable<boolean | UrlTree> {
    return this.authorized$.pipe(
      map(isAuthorized => isAuthorized ? this.preLogoutUrl : true),
    );
  }

  /** Checks whether the auth module may be loaded. */
  public canLoad(): Observable<boolean> {
    return this.authorized$.pipe(
      tap(() => this.router.navigateByUrl(this.preLogoutUrl)),
    );
  }
}

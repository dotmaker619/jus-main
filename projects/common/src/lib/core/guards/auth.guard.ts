import {Injectable} from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
  CanLoad,
  UrlSegment,
  Route,
  UrlTree,
  Router,
} from '@angular/router';
import {AuthService} from '@jl/common/core/services/auth.service';
import { Observable } from 'rxjs';

/** Guard to prevent unauthorized access to routes */
@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanLoad {
  constructor(
    private authService: AuthService,
    private readonly router: Router,
    ) {}

  /** Determine if rout could be achieved */
  public canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): boolean {
    const url: string = state.url;

    return this.checkLogin(url);
  }

  /**
   * @inheritdoc
   */
  public canLoad(route: Route, segments: UrlSegment[]): boolean | Observable<boolean> | Promise<boolean> {
    return this.checkLogin('');
  }

  /** Check if user is authenticated in ath service
   *
   * If user is not authenticated, he will be redirected to login page by
   * authService for further login.
   *
   * @param url - url to be used for redirect after login.
   */
  private checkLogin(url: string): boolean {
    if (this.authService.getAuthToken()) {
      return true;
    }

    this.authService.requireLogin(url);
    return false;
  }
}

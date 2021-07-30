import { Injectable } from '@angular/core';
import { CanLoad, Route, UrlSegment, } from '@angular/router';
import { AuthService } from '@jl/common/core/services/auth.service';
import { Observable } from 'rxjs';

const HANDLING_LINKS = [
  'matters/',
];

/**
 * Check if URL exists in another app - attorney or client.
 *
 * @description
 * We have 3 applications:
 *  - attorney (for attorneys);
 *  - client (for clients);
 *  - marketing (for unauthorized).
 * Because of complex app navigation all unauthorized users always end up in the marketing app.
 * But there are cases when users want to come to the page from another app.
 * E.g.: a user types `/matters/` in the address bar but she is unauthorized. We want to redirect her to the login page
 *  (it's placed in the marketing app) and open /matters/ (from the attorney app) after authorization.
 */
@Injectable({ providedIn: 'root' })
export class AnotherAppGuard implements CanLoad {

  /**
   * @constructor
   * @param authService Auth service.
   */
  public constructor(private readonly authService: AuthService) { }

  /** @inheritdoc */
  public canLoad(
    _: Route,
    segments: UrlSegment[],
  ): Observable<boolean> | Promise<boolean> | boolean {
    const url = this.concatUrlSegmentsToUrl(segments);
    if (HANDLING_LINKS.some((link) => url.includes(link))) {
      this.authService.requireLogin(url);
    }
    return true;
  }

  private concatUrlSegmentsToUrl(segments: UrlSegment[]): string {
    return segments.reduce((acc, cur) => `${acc}/${cur}`, '/');
  }
}

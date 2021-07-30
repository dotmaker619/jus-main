import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
} from '@angular/router';
import { ESignService } from '@jl/common/core/services/esign.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { UrlsService } from '../services/urls.service';

/** Guard to prevent access without e-signature impersonation consent to routes */
@Injectable({
  providedIn: 'root',
})
export class ESignGuard implements CanActivate {
  /**
   * @constructor
   * @param eSignService
   * @param urlsService
   */
  public constructor(
    private readonly eSignService: ESignService,
    private readonly urlsService: UrlsService,
  ) { }

  /** Determine if route could be achieved */
  public canActivate(
    _: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean> {
    const redirectTo = this.urlsService.getApplicationStateUrl(state.url); // After obtain consent return to the certain url.
    return this.hasConsent(redirectTo);
  }

  /**
   * Check if user already has provided impersonation consent to use e-signature provider
   *
   * If user had not provided consent, he would be redirected to consent obtaining page by
   * ESignService.
   *
   * @param redirectUrl - url to be used for redirect after consent obtaining.
   */
  private hasConsent(redirectUrl: string): Observable<boolean> {
    return this.eSignService.isConsentProvided().pipe(
      map(hasConsent => {
        if (!hasConsent) {
          this.eSignService.obtainConsent(redirectUrl);
          return false;
        }
        return true;
      }),
    );
  }
}

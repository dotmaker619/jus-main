import { Injectable } from '@angular/core';

import { AppConfigService } from './app-config.service';

/**
 * Service to provide urls.
 */
@Injectable({
  providedIn: 'root',
})
export class UrlsService {
  /**
   * @constructor
   * @param appConfigService Application config service.
   */
  public constructor(
    private readonly appConfigService: AppConfigService,
  ) { }

  /**
   * Get current application state URL to be able restore it or navigate ot it from external services.
   */
  public getCurrentApplicationStateUrl(): string {
    return new URL(window.location.pathname, this.appConfigService.webVersionUrl).toString();
  }

  /**
   * Get application state url using provided in app url.
   * @param inAppUrl URL inside of application.
   * Example:
   *  getApplicationStateUrl('some/path/to/page') => <base-app-url>/some/path/to/page
   *  where <base-app-url> could be a host name or deep link base URL.
   */
  public getApplicationStateUrl(inAppUrl: string): string {
    return new URL(inAppUrl, this.appConfigService.webVersionUrl).toString();
  }
}

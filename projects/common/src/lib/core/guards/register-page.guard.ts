import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Platform } from '@ionic/angular';
import { InAppBrowserService } from '@jl/common/mobile/services/in-app-browser.service';

import { AppConfigService } from '../services/app-config.service';

/**
 * Prevent opening of registration page from the cordova app.
 *
 * @description
 * In case users try to open registration page from the Cordova app we want to redirect them to
 *  the web registration page.
 */
@Injectable({
  providedIn: 'root',
})
export class RegistrationGuard implements CanActivate {

  /**
   * @constructor
   *
   * @param platform Platform
   * @param appConfig App config
   * @param externalResourcesService External resources service.
   */
  public constructor(
    private readonly platform: Platform,
    private readonly appConfig: AppConfigService,
    private readonly inAppBrowserService: InAppBrowserService,
  ) { }

  /**
   * Determine if a route could be achieved.
   */
  public canActivate(): boolean {
    if (this.platform.is('cordova')) {
      this.inAppBrowserService.openLink(`${this.appConfig.webVersionUrl}auth/register`);
      return false;
    }
    return true;
  }
}

import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';

/**
 * Platform service.
 */
@Injectable({
  providedIn: 'root',
})
export class PlatformService {

  /**
   * @constructor
   */
  public constructor(
    private readonly platform: Platform,
  ) { }

  /**
   * Is mobile device used.
   */
  public get isMobile(): boolean {
    return !!this.platform.platforms().find(platform => platform === 'mobile');
  }

  /**
   * Is tablet used.
   */
  public get isTablet(): boolean {
    return !!this.isWeb || !!this.platform.platforms().find(platform => platform === 'tablet');
  }

  /**
   * Is web app.
   */
  public get isWeb(): boolean {
    return !!this.platform.platforms().find(platform => platform === 'desktop');
  }
}

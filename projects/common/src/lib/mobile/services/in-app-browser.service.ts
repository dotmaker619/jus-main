import { Injectable } from '@angular/core';
import { SafariViewController } from '@ionic-native/safari-view-controller/ngx';

/**
 * Service to open link in browser inside application.
 */
@Injectable({ providedIn: 'root'})
export class InAppBrowserService {

  /**
   * @constructor
   * @param safariViewController Plugin to work with SafariControllerAPI.
   */
  public constructor(
    private readonly safariViewController: SafariViewController,
  ) { }

  /**
   * Open link in browser inside the app.
   */
  public async openLink(url: string): Promise<void> {
    const isAvailable = await this.safariViewController.isAvailable();
    if (isAvailable) {
      this.safariViewController.show({
        url: url,
        animated: false,
      }).toPromise();
    } else {
      window.open(url, '_blank');
    }
  }
}

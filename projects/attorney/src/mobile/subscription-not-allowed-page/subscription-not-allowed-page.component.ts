import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AppConfigService } from '@jl/common/core/services/app-config.service';

/**
 * Page to show a user that subscriptions are not allowed.
 */
@Component({
  selector: 'jlat-subscription-not-allowed-page',
  templateUrl: './subscription-not-allowed-page.component.html',
  styleUrls: ['./subscription-not-allowed-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubscriptionNotAllowedPageComponent {

  /**
   * @constructor
   * @param appConfig App config.
   */
  public constructor(
    private readonly appConfig: AppConfigService,
  ) { }

  /** Web app url. */
  public get appUrl(): string {
    return this.appConfig.webVersionUrl;
  }
}

import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AppConfigService } from '@jl/common/core/services/app-config.service';

/**
 * A page to display information about missing active subscription.
 */
@Component({
  selector: 'jlat-no-active-subscription-page',
  templateUrl: './no-active-subscription-page.component.html',
  styleUrls: ['./no-active-subscription-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoActiveSubscriptionPageComponent {
  /**
   * @constructor
   * @param appConfigService App config service.
   */
  public constructor(appConfigService: AppConfigService) {
    this.isSubscriptionsAllowed = appConfigService.isAttorneySubscriptionAllowed;
  }

  /**
   * Is subscription allowed.
   */
  public readonly isSubscriptionsAllowed: boolean;
}

import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AppConfigService } from '@jl/common/core/services/app-config.service';

/**
 * Component to provide fallback screen in case of
 * client user access of restricted pages.
 */
@Component({
  selector: 'jlat-client-user-fallback',
  templateUrl: './client-user-fallback.component.html',
  styleUrls: ['./client-user-fallback.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientUserFallbackComponent {

  public constructor(
    private appConfig: AppConfigService,
  ) { }

  /**
   * Provide url for client application.
   */
  public get clientVersionAppUrl(): string {
    return this.appConfig.webVersionUrl;
  }
}

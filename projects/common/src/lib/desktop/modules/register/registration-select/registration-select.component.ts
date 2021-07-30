import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AppConfigService } from '@jl/common/core/services/app-config.service';

/**
 * Component for registration type select.
 */
@Component({
  selector: 'jlc-registration-select',
  templateUrl: './registration-select.component.html',
  styleUrls: ['./registration-select.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistrationSelectComponent {

  /**
   * Client dashboard video source.
   */
  public videoURL = this.appConfig.clientDashboardVideoUrl;

  /**
   * @constructor
   *
   * @param appConfig Application config service.
   */
  public constructor(
    private readonly appConfig: AppConfigService,
  ) { }

}

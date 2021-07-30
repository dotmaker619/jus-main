import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AppConfigService } from '@jl/common/core/services/app-config.service';

/**
 * Subheader component.
 */
@Component({
  selector: 'jlc-forum-subheader',
  templateUrl: './subheader.component.html',
  styleUrls: ['./subheader.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubheaderComponent {

  /**
   * Client application video source.
   */
  public videoURL = this.appConfig.clientDashboardVideoUrl;

  /**
   * @constructor
   *
   * @param appConfig Application config.
   */
  public constructor(
    private readonly appConfig: AppConfigService,
  ) {
  }
}

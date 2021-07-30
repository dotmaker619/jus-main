import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Link } from '@jl/common/core/models';
import { AppConfigService } from '@jl/common/core/services/app-config.service';

/** Auth module layout for mobile device. */
@Component({
  selector: 'jlmar-auth-mobile',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthComponent {
  /** Navigation links. */
  public navigationLinks: Link[] = [
    { link: '/attorney-search', label: 'Find an Attorney' },
    { link: '/forum', label: 'Jus-Law Forums' },
    { link: this.appConfig.aboutUsPageUrl, isExternal: true, label: 'About Us' },
  ];

  /**
   * @constructor
   * @param appConfig App config.
   */
  public constructor(
    private readonly appConfig: AppConfigService,
  ) { }
}

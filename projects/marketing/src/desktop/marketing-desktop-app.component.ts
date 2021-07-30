import { Component } from '@angular/core';
import { Link } from '@jl/common/core/models';
import { Role } from '@jl/common/core/models/role';
import { AppConfigService } from '@jl/common/core/services/app-config.service';
import { AuthService } from '@jl/common/core/services/auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Marketing app component.
 */
@Component({
  selector: 'jlmar-marketing-desktop-app',
  templateUrl: 'marketing-desktop-app.component.html',
  styleUrls: ['marketing-desktop-app.component.css'],
})
export class MarketingDesktopAppComponent {

  /** Navigation links. */
  public navigationLinks: Link[] = [
    { link: '/attorney-search', label: 'Find an Attorney' },
    { link: '/forum', label: 'Jus-Law Forums' },
    { link: this.appConfig.aboutUsPageUrl, isExternal: true, label: 'About Us' },
    { link: '/news', label: 'Jus-Law News' },
    { link: '/social', label: 'Social' },
  ];

  /** Navigation buttons (right corner of navbar). */
  public readonly navigationButtons: Link[] = [
    { link: '/auth/login', label: 'login' },
    { link: '/auth/register', label: 'register' },
  ];

  /** Links available only for authorized user. */
  public readonly menuLinks$: Observable<Link[]>;

  /**
   * @constructor
   * @param appConfig
   * @param authService
   */
  public constructor(
    private readonly appConfig: AppConfigService,
    private readonly authService: AuthService,
  ) {
    this.menuLinks$ = this.authService.userType$.pipe(
      map(this.generateMenuLinks),
    );
  }

  private generateMenuLinks(this: void, currentRole: Role): Link[] {
    return [
      { link: '/', label: `Back to ${Role.toReadable(currentRole)} functionality` },
      { link: '/auth/logout', label: 'Logout' },
    ];
  }
}

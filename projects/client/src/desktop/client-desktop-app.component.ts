import { Component, ChangeDetectionStrategy, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { NotificationReceivingService } from '@jl/attorney/shared/services/notification-receiving.service';
import { Link } from '@jl/common/core/models';
import { Role } from '@jl/common/core/models/role';
import { AppConfigService } from '@jl/common/core/services/app-config.service';
import { AuthService } from '@jl/common/core/services/auth.service';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { NotificationsService } from '@jl/common/core/services/notifications.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseClientApp } from '../base-client-app';

/**
 * Application root component.
 */
@Component({
  selector: 'jlcl-client-desktop-app',
  templateUrl: './client-desktop-app.component.html',
  styleUrls: ['./client-desktop-app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientDesktopAppComponent extends BaseClientApp {

  private readonly defaultPerms = [Role.Unauthorized];

  /**
   * User navigation list.
   */
  public readonly navigationLinks$: Observable<Link[]> = this.userService.currentUser$
    .pipe(
      map(currentUser => {
        const links: Link[] = [];
        if (currentUser == null || currentUser.role === Role.Client) {
          links.push({ link: '/attorney-search', label: 'Find an Attorney' });
          links.push({ link: '/forum', label: 'Jus-Law Forums' });
          links.push({ link: '/news', label: 'Jus-Law News' });
          links.push({ link: '/social', label: 'Social' });
        }

        if (currentUser != null && currentUser.role === Role.Client) {
          links.push({ link: '/matters', label: 'Matters' });
        }

        if (currentUser == null) {
          links.push({ link: this.appConfig.aboutUsPageUrl, isExternal: true, label: 'About Us' });
        }

        return links;
      }),
    );

  /**
   * Burger menu links.
   */
  public readonly menuLinks$: Observable<Link[]> = this.userService.currentUser$
    .pipe(
      map(currentUser => {
        const links: Link[] = [];
        if (currentUser == null || currentUser.role === Role.Client) {
          links.push(
            { link: '/profile/account', label: 'My account' },
            { link: '/profile/edit', label: 'Additional Information' },
            { link: '/followed-attorneys', label: 'Attorneys I Follow' },
            { link: '/invoices', label: 'Invoices' },
          );
        }
        if (currentUser != null && currentUser.role === Role.Attorney) {
          links.push({ link: '/attorney/subscription', label: 'Subscription' });
        }
        links.push(
          { link: '/privacy-policy', label: 'Privacy Policy' },
          { link: '/terms-of-use', label: 'Terms of Use' },
          { link: '/auth/logout', label: 'Log out' },
        );
        return links;
      }),
    );

  /**
   * Navigation buttons (right corner of navbar).
   */
  public readonly navigationButtons: Link[] = [
    { link: '/auth/login', label: 'login' },
    { link: '/auth/register', label: 'register' },
  ];

  /**
   * @constructor
   * @param permService
   * @param userService
   * @param appConfig
   * @param platform
   * @param notificationsService
   * @param authService
   * @param router
   * @param notificationReceivingService
   */
  public constructor(
    private readonly permService: NgxPermissionsService,
    private readonly userService: CurrentUserService,
    private readonly appConfig: AppConfigService,
    protected readonly platform: Platform,
    protected readonly notificationsService: NotificationsService,
    protected readonly authService: AuthService,
    protected readonly router: Router,
    protected readonly notificationReceivingService: NotificationReceivingService,
  ) {
    super(
      platform,
      notificationsService,
      authService,
      router,
      notificationReceivingService,
    );
    this.permService.loadPermissions(this.defaultPerms);
    this.authService.userType$.subscribe(
      userType => this.permService.loadPermissions([userType]),
    );
  }
}

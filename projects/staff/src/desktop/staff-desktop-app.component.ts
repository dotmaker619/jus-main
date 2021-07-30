import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { LinkWithBadge } from '@jl/attorney/shared/models/link-with-badge';
import { NotificationReceivingService } from '@jl/attorney/shared/services/notification-receiving.service';
import { Link } from '@jl/common/core/models/link';
import { AppConfigService } from '@jl/common/core/services/app-config.service';
import { AuthService } from '@jl/common/core/services/auth.service';
import { NotificationsService } from '@jl/common/core/services/notifications.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseStaffApp } from '../base-staff-app';

/** App component for staff on desktop. */
@Component({
  selector: 'jlst-staff-desktop-app',
  templateUrl: './staff-desktop-app.component.html',
  styleUrls: ['./staff-desktop-app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StaffDesktopAppComponent extends BaseStaffApp {
  /** Navigation links. */
  public readonly navigationLinks: Link[] = [
    { link: '/matters', label: 'Matters' },
    { link: '/invoices', label: 'Invoices' },
    { link: '/documents', label: 'Documents' },
    { link: '/forum', label: 'Forum' },
    { link: this.appConfig.aboutUsPageUrl, isExternal: true, label: 'About Us' },
  ];

  /** Menu links. */
  public readonly menuLinks$: Observable<LinkWithBadge[]>;

  /**
   * @constructor
   * @param router
   * @param authService
   * @param notificationsService
   * @param notificationReceivingService
   * @param platform
   * @param appConfig
   */
  public constructor(
    router: Router,
    authService: AuthService,
    notificationsService: NotificationsService,
    notificationReceivingService: NotificationReceivingService,
    platform: Platform,
    private readonly appConfig: AppConfigService,
  ) {
    super(
      authService,
      router,
      notificationsService,
      notificationReceivingService,
      platform,
    );
    this.menuLinks$ = this.initMenuLinksStream();
  }

  private generateMenuLinks(this: void, notificationsNum: number): LinkWithBadge[] {
    return [
      { link: '/profile/account-info', label: 'My Account' },
      { link: '/profile/edit', label: 'Additional Information' },
      {
        link: '/notifications',
        label: 'Notifications',
        badge: notificationsNum ? notificationsNum.toString() : '',
      },
      { link: '/forum/followed-topics', label: 'Topics I Follow' },
      { link: '/privacy-policy', label: 'Privacy Policy' },
      { link: '/terms-of-use', label: 'Terms of Use' },
      { link: '/auth/logout', label: 'Log out' },
    ];
  }

  private initMenuLinksStream(): Observable<LinkWithBadge[]> {
    return this.notificationsCount$.pipe(
      map(this.generateMenuLinks),
    );
  }
}

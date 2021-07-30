import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { LinkWithBadge } from '@jl/attorney/shared/models/link-with-badge';
import { NotificationReceivingService } from '@jl/attorney/shared/services/notification-receiving.service';
import { User } from '@jl/common/core/models/user';
import { AuthService } from '@jl/common/core/services/auth.service';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { NotificationsService } from '@jl/common/core/services/notifications.service';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseStaffApp } from '../base-staff-app';

/** App component for staff on mobile device. */
@Component({
  selector: 'jlst-staff-mobile-app',
  templateUrl: './staff-mobile-app.component.html',
  styleUrls: ['./staff-mobile-app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class StaffMobileAppComponent extends BaseStaffApp {
  /** Burger menu links. */
  public readonly menuLinks$: Observable<LinkWithBadge[]>;
  /** Current user. */
  public readonly currentUser$: Observable<User>;

  /**
   * @constructor
   * @param authService Auth service.
   * @param router Router.
   * @param currentUserService Current user service.
   * @param notificationsService Notifications service.
   */
  public constructor(
    authService: AuthService,
    router: Router,
    notificationReceivingService: NotificationReceivingService,
    notificationsService: NotificationsService,
    platform: Platform,
    currentUserService: CurrentUserService,
  ) {
    super(
      authService,
      router,
      notificationsService,
      notificationReceivingService,
      platform,
    );
    this.currentUser$ = currentUserService.currentUser$;
    this.menuLinks$ = this.initMenuLinksStream();
  }

  private generateMenuLinks(this: void, notificationsNum: number): LinkWithBadge[] {
    return [
      { link: '/profile/account-info', label: 'My Account' },
      { link: '/profile/edit', label: 'Additional Information' },
      { link: '/matters', label: 'Matters' },
      { link: '/invoices', label: 'Invoices' },
      { link: '/documents', label: 'Documents' },
      { link: '/forum', label: 'Forum' },
      { link: '/forum/followed-topics', label: 'Topics I Follow' },
      {
        link: '/notifications',
        label: 'Notifications',
        badge: notificationsNum ? notificationsNum.toString() : '',
      },
      { link: '/privacy-policy', label: 'Privacy Policy' },
      { link: '/terms-of-use', label: 'Terms of Use' },
    ];
  }

  private initMenuLinksStream(): Observable<LinkWithBadge[]> {
    return this.notificationsCount$.pipe(
      map(this.generateMenuLinks),
    );
  }
}

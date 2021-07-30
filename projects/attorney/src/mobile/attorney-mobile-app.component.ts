import { Component, ChangeDetectionStrategy, ViewEncapsulation, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Platform, NavController } from '@ionic/angular';
import { LinkWithBadge } from '@jl/attorney/shared/models/link-with-badge';
import { AppConfigService } from '@jl/common/core/services/app-config.service';
import { AuthService } from '@jl/common/core/services/auth.service';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { NotificationsService } from '@jl/common/core/services/notifications.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { Observable, combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { BaseAttorneyApp } from '../base-attorney-app';
import { NotificationReceivingService } from '../shared/services/notification-receiving.service';

/**
 * Badges of menu links.
 */
interface MenuLinkBadges {
  /** Documents number. */
  documents?: number;
  /** Notifications number. */
  notifications?: number;
}

/** Mobile layout component. Contains mobile-specific components that should always be rendered on mobile device. */
@Component({
  selector: 'jlat-attorney-mobile-app',
  templateUrl: './attorney-mobile-app.component.html',
  styleUrls: ['./attorney-mobile-app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class AttorneyMobileAppComponent extends BaseAttorneyApp {
  /** Menu navigation list. */
  public readonly menuLinks$: Observable<LinkWithBadge[]>;
  /** Current user. */
  public readonly currentUser$ = this.userService.currentUser$;
  /** Notifications. */
  private readonly notifications$ = this.notification.unreadNotifications$;

  /**
   * @constructor
   * @param userService
   * @param notification
   * @param navCtrl
   * @param appConfig
   * @param authService
   * @param router
   * @param platform
   * @param permService
   * @param notificationsService
   * @param notificationReceivingService
   */
  public constructor(
    private readonly userService: CurrentUserService,
    private readonly notification: NotificationsService,
    private readonly navCtrl: NavController,
    private readonly appConfig: AppConfigService,
    protected readonly authService: AuthService,
    protected readonly router: Router,
    protected readonly platform: Platform,
    protected readonly permService: NgxPermissionsService,
    protected readonly notificationsService: NotificationsService,
    protected readonly notificationReceivingService: NotificationReceivingService,
  ) {
    super(
      platform,
      router,
      permService,
      authService,
      notificationsService,
      notificationReceivingService,
    );
    this.menuLinks$ = this.initMenuLinksStream();

    // Get current router outlet and check if it's possible to go back.
    this.platform.backButton.subscribeWithPriority(0, () => {
      const outlet = (this.navCtrl as any).topOutlet;
      if (outlet.canGoBack()) {
        outlet.pop();
      } else {
        (navigator as any).app.exitApp();
      }
    });
  }

  /**
   * TrackBy function for menu items.
   * @param _ Index.
   * @param item Menu item.
   */
  public trackMenuItem(_: number, item: LinkWithBadge): string {
    return item.link;
  }

  private generateMenuLinks(values: MenuLinkBadges = {}): LinkWithBadge[] {
    const subscriptionMenuItemLink = this.appConfig.isAttorneySubscriptionAllowed
      ? '/subscription'
      : '/subscription-is-not-allowed';
    const links: LinkWithBadge[] = [
      { link: '/dashboard', label: 'Dashboard' },
      { link: '/leads', label: 'Leads' },
      { link: '/matters', label: 'Matters' },
      { link: '/clients', label: 'Clients' },
      {
        link: '/documents',
        label: 'Documents',
        badge: values.documents ? values.documents.toString() : '',
      },
      { link: '/invoices', label: 'Invoices' },
      { link: '/forum', label: 'Forum' },
      {
        link: '/notifications',
        label: 'Notifications',
        badge: values.notifications ? values.notifications.toString() : '',
      },
      { link: '/profile/account-info', label: 'My Account' },
      { link: '/profile/edit', label: 'My Profile' },
      { link: '/events', label: 'Events' },
      { link: subscriptionMenuItemLink, label: 'Subscription' },
      { link: '/connect', label: 'Direct Deposit' },
      { link: '/forum/followed-topics', label: 'Topics I follow' },
      { link: '/customizations', label: 'Customizations' },
      { link: '/news', label: 'Jus-Law News' },
      { link: '/social', label: 'Social' },
      { link: '/social/networks', label: 'Networks' },
      { link: '/privacy-policy', label: 'Privacy Policy' },
      { link: '/terms-of-use', label: 'Terms of Use' },
    ];

    return links;
  }

  private initMenuLinksStream(): Observable<LinkWithBadge[]> {
    return combineLatest([
      this.notifications$,
    ])
      .pipe(
        map(([unreadNotifications]) => this.generateMenuLinks({
          notifications: unreadNotifications,
        })),
        startWith(this.generateMenuLinks()),
      );
  }
}

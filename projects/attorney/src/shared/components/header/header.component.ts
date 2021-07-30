import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Link } from '@jl/common/core/models';
import { Attorney } from '@jl/common/core/models/attorney';
import { AppConfigService } from '@jl/common/core/services/app-config.service';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { NotificationsService } from '@jl/common/core/services/notifications.service';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { LinkWithBadge } from '../../models/link-with-badge';

/** Header component. */
@Component({
  selector: 'jlat-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {

  /** Notifications. */
  public notifications$ = this.notification.unreadNotifications$;
  /** Navigation links. */
  @Input()
  public navigationLinks: Link[];

  /** Burger menu navigation list. */
  public readonly menuLinks$: Observable<LinkWithBadge[]> = combineLatest(this.notifications$)
    .pipe(
      map(([unreadNotifications]) => this.generateMenuLinks(unreadNotifications)),
    );

  /** Is opened menu popover. */
  public readonly isOpened$ = new BehaviorSubject(false);

  /**
   * Attorney information.
   */
  public readonly attorney$: Observable<Attorney>;

  /**
    * @constructor
    * @param notification Notification service
    * @param userService User service
    * @param appConfigService Application config service.
   */
  public constructor(
    public notification: NotificationsService,
    public userService: CurrentUserService,
    private readonly appConfigService: AppConfigService,
  ) {
    this.attorney$ = this.userService.getAttorneyUser();
  }

  /** Set isOpened$ to true. */
  public onOpenMenuClicked(): void {
    this.isOpened$.next(true);
  }

  /** Set isOpened$ to false. */
  public onMenuClosed(): void {
    this.isOpened$.next(false);
  }

  private generateMenuLinks(unreadNotifications: number): LinkWithBadge[] {
    const links: LinkWithBadge[] = [
      {
        link: '/notifications',
        label: 'Notifications',
        badge: unreadNotifications ? unreadNotifications.toString() : '',
      },
      { link: '/profile/account-info', label: 'My Account' },
      { link: '/profile/edit', label: 'My Profile' },
      { link: '/events', label: 'Events' },
    ];

    // If subscription management is not allowed for current environment then display a special page with additional information.
    const subscriptionMenuItemLink = this.appConfigService.isAttorneySubscriptionAllowed
      ? '/subscription'
      : '/subscription-is-not-allowed';
    links.push({ link: subscriptionMenuItemLink, label: 'Subscription' });

    links.push(
      { link: '/connect', label: 'Direct Deposit' },
      { link: '/forum', label: 'Forum' },
      { link: '/forum/followed-topics', label: 'Topics I Follow' },
      { link: '/customizations', label: 'Customizations' },
      { link: '/news', label: 'Jus-Law News' },
      { link: '/social', label: 'Social' },
      { link: '/social/networks', label: 'My Network' },
      { link: '/privacy-policy', label: 'Privacy Policy' },
      { link: '/terms-of-use', label: 'Terms of Use' },
      { link: '/auth/logout', label: 'Log Out' },
    );
    return links;
  }
}

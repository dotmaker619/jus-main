import { Component, ChangeDetectionStrategy, ViewEncapsulation, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { LinkWithBadge } from '@jl/attorney/shared/models/link-with-badge';
import { NotificationReceivingService } from '@jl/attorney/shared/services/notification-receiving.service';
import { Role } from '@jl/common/core/models/role';
import { AuthService } from '@jl/common/core/services/auth.service';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { NotificationsService } from '@jl/common/core/services/notifications.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { BaseClientApp } from '../base-client-app';

/**
 * Application root component.
 */
@Component({
  selector: 'jlcl-client-mobile-app',
  templateUrl: './client-mobile-app.component.html',
  styleUrls: ['./client-mobile-app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ClientMobileAppComponent extends BaseClientApp {

  private readonly defaultPerms = [Role.Unauthorized];

  /** Current user. */
  public readonly currentUser$ = this.userService.currentUser$;

  /** Burger menu links. */
  public readonly menuLinks$: Observable<LinkWithBadge[]>;

  /**
   * @constructor
   * @param permService
   * @param userService
   * @param platform
   * @param notificationsService
   * @param authService
   * @param router
   * @param notificationReceivingService
   */
  public constructor(
    private readonly permService: NgxPermissionsService,
    private readonly userService: CurrentUserService,
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
    this.menuLinks$ = this.initMenuStream();
  }

  private initMenuStream(): Observable<LinkWithBadge[]> {
    return this.notificationsService.unreadNotifications$.pipe(
      map(notificationsCount =>
        this.generateMenuLinks(notificationsCount.toString())),
      startWith(this.generateMenuLinks()),
    );
  }

  private generateMenuLinks(notificationsCount?: string): LinkWithBadge[] {
    return [
      { link: '/', label: 'Home' },
      { link: '/forum', label: 'Forums' },
      { link: '/forum/followed-topics', label: 'Topics I Follow' },
      { link: '/chats', label: 'Messages' },
      { link: '/notifications', label: 'Notifications', badge: notificationsCount },
      { link: '/matters', label: 'Matters' },
      { link: '/profile/account-info', label: 'My Account' },
      { link: '/profile/edit', label: 'Additional Information' },
      { link: '/followed-attorneys', label: 'Attorneys I Follow' },
      { link: '/invoices', label: 'Invoices' },
      { link: '/news', label: 'Jus-Law News' },
      { link: '/social', label: 'Social' },
      { link: '/privacy-policy', label: 'Privacy Policy' },
      { link: '/terms-of-use', label: 'Terms of Use' },
    ];
  }
}

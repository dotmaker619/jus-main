import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { LinkWithBadge } from '@jl/attorney/shared/models/link-with-badge';
import { Link } from '@jl/common/core/models';
import { Role } from '@jl/common/core/models/role';
import { User } from '@jl/common/core/models/user';
import { LeadChatService } from '@jl/common/core/services/chats/lead-chat.service';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { NotificationsService } from '@jl/common/core/services/notifications.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/** Header component. */
@Component({
  selector: 'jlc-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  /** Navigation links. */
  @Input()
  public navigationLinks: Link[];

  /** Navigation buttons. */
  @Input()
  public navigationButtons: Link[];

  /** Burger menu links. */
  @Input()
  public menuLinks: LinkWithBadge[];

  /**
   * Current user info.
   */
  public readonly currentUser$: Observable<User>;

  /**
   * Is current user has Client role.
   */
  public readonly isClientUser$: Observable<boolean>;

  /** Is opened menu popover. */
  public readonly isOpened$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  /**
   * @constructor
   * @param userService User service.
   * @param notificationsService Notifications service.
   * @param chatsService Chats service.
   */
  public constructor(
    private readonly userService: CurrentUserService,
    private readonly notificationsService: NotificationsService,
    private readonly chatsService: LeadChatService,
  ) {
    this.currentUser$ = this.userService.currentUser$;
    this.isClientUser$ = this.userService.currentUser$
      .pipe(
        map(currentUser => currentUser != null && currentUser.role === Role.Client),
      );
  }

  /** Number of unread notifications. */
  public readonly unreadNotifications$ = this.notificationsService.unreadNotifications$;

  /** Number of unread chats. */
  public readonly unreadChatsCount$: Observable<number> = this.chatsService.getCurrentUserChats().pipe(
    map(chats =>
      // Get number of chats with unread messages.
      chats
        .map(chat => chat.countUnreadMessages)
        .filter(unreadMessages => unreadMessages > 0)
        .length,
    ),
  );

  /** Set isOpened$ to true. */
  public onMenuClicked(): void {
    this.isOpened$.next(true);
  }

  /** Set isOpened$ to false. */
  public onMenuClosed(): void {
    this.isOpened$.next(false);
  }
}

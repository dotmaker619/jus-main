import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NotificationsService } from '@jl/common/core/services/notifications.service';
import { Observable } from 'rxjs';

/** Notifications page component for attorney. */
@Component({
  selector: 'jlc-notifications-header',
  templateUrl: './notifications-header.component.html',
  styleUrls: ['./notifications-header.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsHeaderComponent {

  /** Number of unread notifications. */
  public notifications$: Observable<number> = this.notificationsService.unreadNotifications$;

  /**
   * @constructor
   * @param notificationsService Notifications service.
   */
  public constructor(private readonly notificationsService: NotificationsService) { }
}

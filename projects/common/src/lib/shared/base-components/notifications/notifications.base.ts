import { ExtendedNotification } from '@jl/common/core/models/extended-notification';
import { NotificationsService } from '@jl/common/core/services/notifications.service';
import { BehaviorSubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';

/** Base class for notifications component. */
export class BaseNotifications {
  /** Is loading. */
  public isLoading$ = new BehaviorSubject<boolean>(false);

  /** Current notifications. */
  public notifications$ = this.notificationsService.unreadNotifications$.pipe(
    switchMap(() => this.notificationsService.getNotifications()),
  );

  /**
   * @constructor
   * @param notificationsService Notifications service.
   */
  public constructor(
    protected readonly notificationsService: NotificationsService,
  ) {
  }

  /**
   * Handle notification click.
   * @param notification Notification.
   */
  public onNotificationClick(notification: ExtendedNotification): void {
    this.notificationsService.pushNotification(notification);
  }

  /**
   * Track notification by id.
   *
   * @param notification Notification.
   */
  public trackNotification(_: number, notification: ExtendedNotification): number {
    return notification.id;
  }
}

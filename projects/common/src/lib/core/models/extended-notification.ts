import { NotificationStatus } from './notification-status';
import { ShortNotification } from './short-notification';

/**
 * Extended notification model.
 *
 * It used for displaying information on notifications page. Contains specific information like date, content etc.
 */
export class ExtendedNotification extends ShortNotification {
  /** Title. */
  public title?: string;
  /** Text content. */
  public content?: string;
  /** Id of notification type. */
  public typeId?: number;
  /** Notification date. */
  public date: Date;
  /**
   * @constructor
   * @param notification Notification.
   */
  public constructor(notification: Partial<ExtendedNotification>) {
    super(notification);
    this.dispatchId = notification.dispatchId;
    this.status = notification.status;
    this.title = notification.title;
    this.content = notification.content;
    this.typeId = notification.typeId;
    this.date = notification.date;
  }

  /** Is notification read. */
  public get isRead(): boolean {
    return this.status === NotificationStatus.Read;
  }
}

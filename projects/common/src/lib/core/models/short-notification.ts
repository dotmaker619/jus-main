import { NotificationStatus } from './notification-status';
import { NotificationType } from './notification-type';

/** Short notification model. Contains the most significant information about a notification. */
export class ShortNotification {
  /** Notification id. */
  public id?: number;
  /** Text id of a notification. */
  public type: NotificationType;
  /** Object id with which notification is connected. */
  public objectId: number;
  /** Dispatch id. It should be used to update the status of notification. */
  public dispatchId: number;
  /** Dispatch status */
  public status: NotificationStatus;
  /**
   * @constructor
   * @param notification Notification.
   */
  public constructor(notification: Partial<ShortNotification>) {
    this.id = notification.id;
    this.type = notification.type;
    this.objectId = notification.objectId;
    this.status = notification.status;
  }
}

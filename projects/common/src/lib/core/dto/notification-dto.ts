import { NotificationTypeDto } from './notification-type-dto';

/** Notification dto. */
export interface NotificationDto {
  /** Notification id. */
  id?: number;
  /** Notification title. */
  title: string;
  /** Notification content. */
  content?: string;
  /** Notification type. */
  runtime_tag: NotificationTypeDto;
  /** Notification type id. */
  type: number;
  /**
   * Id of the object with which notification is connected.
   * (e.g. Id of a chat for notification about a new message)
   */
  object_id: number;
}

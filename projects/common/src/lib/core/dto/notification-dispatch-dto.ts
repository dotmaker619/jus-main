import { NotificationDto } from './notification-dto';
import { NotificationStatusDto } from './notification-status-dto';

/** Notification dto. */
export interface NotificationDispatchDto {
  /** Id of notification dispatch. */
  id: number;
  /** Notification bound to dispatch. */
  notification?: NotificationDto;
  /** Status of dispatch. */
  status: NotificationStatusDto;
  /** Date of creation. */
  created: string;
}

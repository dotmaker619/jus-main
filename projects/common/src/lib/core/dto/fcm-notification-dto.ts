import { NotificationDto } from './notification-dto';

/** Firebase cloud message dto model. */
export interface FcmNotificationDto extends NotificationDto {
  /** Where the notification has been appeared. */
  tap?: 'foreground' | 'background';
  /** Id of notification dispatch. */
  dispatch_id: string;
}

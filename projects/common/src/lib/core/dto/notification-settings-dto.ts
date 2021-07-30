import { NotificationTypeDescriptionDto } from '@jl/common/core/dto/notification-config-dto';

/** Keys of Notifications Settings dto values */
export type NotificationsSettingsDtoKey = 'by_email' | 'by_push';

/** Dto for notifications settings model. */
export interface NotificationSettingsDto {
  /** Id */
  id?: number;

  /** Notification type identifier */
  notification_type: number;

  /** Notification Type data */
  notification_type_data?: NotificationTypeDescriptionDto;

  /** By Email */
  by_email: boolean;

  /** By Push */
  by_push: boolean;
}

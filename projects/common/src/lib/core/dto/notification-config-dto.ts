import { NotificationGroupDto } from './notification-group-dto';
import { NotificationTypeDto } from './notification-type-dto';

/** Dto for notifications type model. */
export interface NotificationTypeDescriptionDto {
  /** Id */
  id: number;

  /** Human-readable name of a type */
  title: string;

  /** Code related name of notification type */
  runtime_tag: NotificationTypeDto;

  /** Describes notification type receiver */
  recipient_type: 'client' | 'attorney' | 'all';

  /** Group */
  group: NotificationGroupDto;
}

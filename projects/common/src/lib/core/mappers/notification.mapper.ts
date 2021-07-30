import { Injectable } from '@angular/core';

import { NotificationTypeDescriptionDto } from '../dto/notification-config-dto';
import { NotificationDispatchDto } from '../dto/notification-dispatch-dto';
import { NotificationDto } from '../dto/notification-dto';
import { NotificationSettingsDto } from '../dto/notification-settings-dto';
import { NotificationStatusDto } from '../dto/notification-status-dto';
import { NotificationTypeDto } from '../dto/notification-type-dto';
import { MapperFromDto } from '../mappers/mapper';
import { ExtendedNotification } from '../models/extended-notification';
import { NotificationTypeDescription } from '../models/notification-config';
import { NotificationTypeDescriptionOrGroup, NotificationGroup } from '../models/notification-group';
import { NotificationStatus } from '../models/notification-status';
import { NotificationType } from '../models/notification-type';
import { ShortNotification } from '../models/short-notification';

interface NotificationsData {
  /** Array of notifications type DTOs. */
  types: NotificationTypeDescriptionDto[];
  /** Array of notifications settings DTOs. */
  settings: NotificationSettingsDto[];
}

const notificationTypeMap: Record<NotificationTypeDto, NotificationType> = {
  'new_attorney_post': NotificationType.NewAttorneyPost,
  'new_attorney_event': NotificationType.NewEvent,
  'document_shared_by_attorney': NotificationType.DocumentShared,
  'new_message': NotificationType.NewMessage,
  'matter_status_update': NotificationType.MatterStatusUpdated,
  'new_chat': NotificationType.NewChat,
  'new_opportunities': NotificationType.NewOpportunity,
  'new_post': NotificationType.NewTopicPost,
  'new_video_call': NotificationType.NewVideoCall,
  'new_group_chat': NotificationType.NewGroupChat,
  'new_matter_shared': NotificationType.MatterShared,
};

const notificationStatusMapFromDto: Record<NotificationStatusDto, NotificationStatus> = {
  'prepared': NotificationStatus.Prepared,
  'read': NotificationStatus.Read,
  'sent': NotificationStatus.Sent,
};

/** Notification mapper. */
@Injectable({
  providedIn: 'root',
})
export class NotificationMapper implements MapperFromDto<NotificationDispatchDto, ExtendedNotification> {
  /** @inheritdoc */
  public fromDto(data: NotificationDispatchDto): ExtendedNotification {
    if (data == null) {
      return null;
    }
    return new ExtendedNotification({
      content: data.notification.content,
      id: data.id,
      objectId: data.notification.object_id,
      title: data.notification.title,
      type: this.mapNotificationTypeFromDto(data.notification.runtime_tag),
      dispatchId: data.id,
      status: this.mapNotificationStatusFromDto(data.status),
      typeId: data.notification.type,
      date: new Date(data.created),
    });
  }

  /** Map short notification from dto. */
  public shortNotificationFromDto(data: NotificationDto): ShortNotification {
    if (data == null) {
      return null;
    }
    return new ShortNotification({
      id: data.id,
      objectId: data.object_id,
      type: this.mapNotificationTypeFromDto(data.runtime_tag),
      dispatchId: data.id,
    });
  }

  /** Map notification settings from dto. */
  public settingsToDto(data: NotificationTypeDescription): NotificationSettingsDto {
    if (data == null) {
      return null;
    }
    return {
      notification_type: data.id,
      by_email: data.settings.byEmail,
      by_push: data.settings.byPush,
    };
  }

  /** Map notification type description from dto. */
  public typeDescriptionFromDto(data: NotificationsData): NotificationTypeDescriptionOrGroup[] {
    if (data == null) {
      return null;
    }
    return this.groupNotificationsTypes(data);
  }

  /** Map notification type from dto. */
  public mapNotificationTypeFromDto(type: NotificationTypeDto): NotificationType {
    return notificationTypeMap[type];
  }

  /** Map notification status from dto. */
  public mapNotificationStatusFromDto(status: NotificationStatusDto): NotificationStatus {
    return notificationStatusMapFromDto[status];
  }

  private groupNotificationsTypes(data: NotificationsData): NotificationTypeDescriptionOrGroup[] {
    return data.types.reduce<NotificationTypeDescriptionOrGroup[]>((accConfigs, config) => {
      const settings = data.settings.find(s => s.notification_type === config.id);
      const notificationConfig = new NotificationTypeDescription({
        ...config,
        type: notificationTypeMap[config.runtime_tag],
        settings: {
          byPush: settings ? settings.by_push : false,
          byEmail: settings ? settings.by_email : false,
        },
      });

      if (config.group) {
        this.createOrUpdateNotificationsGroup(accConfigs, config, notificationConfig);
      } else {
        accConfigs.push(notificationConfig);
      }

      return accConfigs;
    }, []);
  }

  private createOrUpdateNotificationsGroup(
    types: NotificationTypeDescriptionOrGroup[],
    type: NotificationTypeDescriptionDto,
    notificationConfig: NotificationTypeDescription,
  ): void {
    const group = types
      .filter((item): item is NotificationGroup => 'types' in item)
      .find(g => g.id === type.group.id);

    if (group) {
      group.types.push(notificationConfig);
    } else {
      types.push(new NotificationGroup({
        ...type.group,
        types: [notificationConfig],
      }));
    }
  }
}

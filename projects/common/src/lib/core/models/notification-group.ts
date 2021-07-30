import { NotificationTypeDescription } from '@jl/common/core/models/notification-config';

/** Notifications type or group. */
export type NotificationTypeDescriptionOrGroup = NotificationTypeDescription | NotificationGroup;

/** Notifications Group */
export class NotificationGroup {
  /** Id */
  public id: number;

  /** Notification group title which will be displayed for the user */
  public title: string;

  /** Notifications Types */
  public types: NotificationTypeDescription[];

  /**
   * @constructor
   * @param group
   */
  constructor(group: Partial<NotificationGroup>) {
    this.id = group.id;
    this.title = group.title;
    this.types = group.types;
  }
}

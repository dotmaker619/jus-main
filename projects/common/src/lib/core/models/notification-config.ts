import { NotificationType } from './notification-type';

/** Recipient Type describes notification type receiver */
export enum NotificationsRecipientType {
  /** Client */
  Client = 'client',
  /** Attorney */
  Attorney = 'attorney',
  /** All */
  All = 'all',
}

/** Keys of notifications settings values */
export type NotificationsSettingsKey = 'byEmail' | 'byPush';

/** Notifications settings model type. */
export type NotificationsSettings = {
  [key in NotificationsSettingsKey]: boolean;
};

/** Extended information about notification type. */
export class NotificationTypeDescription {
  /** Id. */
  public id: number;

  /** Human-readable name of a type. */
  public title: string;

  /** Current settings of this notifications type. */
  public settings: NotificationsSettings;

  /** Type of notification. */
  public type: NotificationType;

  /**
   * @constructor
   * @param config
   */
  public constructor(config: Partial<NotificationTypeDescription>) {
    this.id = config.id;
    this.title = config.title;
    this.settings = config.settings;
    this.type = config.type;
  }
}

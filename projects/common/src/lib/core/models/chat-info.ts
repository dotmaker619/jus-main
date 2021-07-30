import { User } from './user';

/**
 * Chat info.
 */
export class ChatInfo {
  /**
   * Chat ID.
   */
  public id?: string;

  /**
   * Count unread messages.
   */
  public readonly countUnreadMessages: number;

  /**
   * Last read message ID.
   */
  public readonly lastReadMessageId: string | null = null;

  /**
   * Last chat message text.
   */
  public readonly lastMessageText: string | null = null;

  /**
   * Last chat message date.
   */
  public readonly lastMessageDate: Date | null = null;

  /**
   * Sender.
   */
  public readonly sender: User;

  /**
   * Date of creation.
   */
  public readonly created: Date = new Date();

  /**
   * @constructor
   * @param data Data.
   */
  public constructor(data: Partial<ChatInfo>) {
    this.id = data.id;
    this.countUnreadMessages = data.countUnreadMessages;
    this.sender = data.sender;
    this.lastReadMessageId = data.lastReadMessageId;
    this.lastMessageDate = data.lastMessageDate;
    this.lastMessageText = data.lastMessageText;
    this.created = data.created;
  }

  /**
   * Date of last activity.
   */
  get lastActivityDate(): Date {
    if (this.lastMessageDate) {
      return this.lastMessageDate;
    }
    return this.created;
  }
}

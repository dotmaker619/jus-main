import { User } from '../user';

/**
 * Chat message.
 */
export abstract class Message {
  /**
   * Message ID.
   */
  public readonly id?: string;
  /**
   * Sender.s
   */
  public readonly author: User;
  /**
   * Created date.
   */
  public readonly created: Date;
  /**
   * Is the current message belongs to the current user.
   */
  public isMyMessage?: boolean;
  /**
   * @constructor
   * @param data Initialized data.
   */
  public constructor(data: Partial<Message>) {
    this.id = data.id;
    this.author = data.author;
    this.created = data.created;
    this.isMyMessage = data.isMyMessage;
  }
}

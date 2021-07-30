import { Message } from './message';

/**
 * Attachment model.
 *
 * Used only in Text message.
 */
export interface Attachment {
  /** Attachment title. */
  title: string;
  /** Attachment url. */
  url: string;
}

/**
 * Text message.
 */
export class TextMessage extends Message {
  /** Message text. */
  public text: string;

  /** Attachment. */
  public files: Attachment[];
  /**
   * @constructor
   *
   * @param message Message.
   */
  public constructor(message: Partial<TextMessage>) {
    super(message);
    this.text = message.text;
    this.files = message.files;
  }
}

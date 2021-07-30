import { AnnounceMessage } from './announce-message';
import { Message } from './message';
import { TextMessage } from './text-message';
import { UnsupportedMessage } from './unsupported-message';

export namespace ChatMessageTypes {
  /**
   * Is message a text.
   * @param message Message.
   */
  // tslint:disable-next-line: completed-docs
  export function isTextMessage(message: Message): message is TextMessage {
    return message instanceof TextMessage;
  }

  /**
   * Is announce message passed as a param.
   * @param message Message.
   */
  // tslint:disable-next-line: completed-docs
  export function isAnnounceMessage(message: Message): message is AnnounceMessage {
    return message instanceof AnnounceMessage;
  }

  /**
   * Is message unsupported,
   * @param message Chat message.
   */
  // tslint:disable-next-line: completed-docs
  export function isUnsupportedMessage(message: Message): message is UnsupportedMessage {
    return message instanceof UnsupportedMessage;
  }
}

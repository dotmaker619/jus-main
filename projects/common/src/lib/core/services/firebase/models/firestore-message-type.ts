import { FirestoreChatMessage } from './firestore-chat-message';
import { FirestoreChatTextMessage, FirestoreAnnounceMessage } from './firestore-chat-text-message';

export namespace FirestoreChatMessageTypes {
  /**
   * Is message a text.
   * @param message Message.
   */
  // tslint:disable-next-line: completed-docs
  export function isTextMessage(message: FirestoreChatMessage): message is FirestoreChatTextMessage {
    return message.type === 'text';
  }

  /**
   * Is message a text.
   * @param message Message.
   */
  // tslint:disable-next-line: completed-docs
  export function isAnnounceMessage(message: FirestoreChatMessage): message is FirestoreAnnounceMessage {
    return message.type === 'announce';
  }

  /**
   * Extract short human-readable information about the message depending on its type.
   *
   * @param message Message.
   */
  // tslint:disable-next-line: completed-docs
  export function getMessagePreviewText(message: FirestoreChatMessage): string {
    if (isTextMessage(message)) {
      const hasFiles = message.files && message.files.length > 0;
      const hasText = message.text != null;
      return hasText ? message.text : hasFiles ? 'Attachments' : null;
    } else if (isAnnounceMessage(message)) {
      return message.text;
    }
    throw new TypeError('Undefined type of message.');
  }
}

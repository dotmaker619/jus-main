import { firestore } from 'firebase';

import { AnnounceMessage } from '../models/chat/announce-message';
import { Message } from '../models/chat/message';
import { ChatMessageTypes } from '../models/chat/message-type';
import { TextMessage } from '../models/chat/text-message';
import { UnsupportedMessage } from '../models/chat/unsupported-message';
import { User } from '../models/user';
import { FirestoreChatMessage, firestoreChatMessageDateToNumber } from '../services/firebase/models/firestore-chat-message';
import { FirestoreChatTextMessage, FirestoreAnnounceMessage } from '../services/firebase/models/firestore-chat-text-message';
import { FirestoreChatMessageTypes } from '../services/firebase/models/firestore-message-type';

/**
 * Chat messages mapper.
 */
export class MessageMapper {
  /**
   * Map Firestore message to domain chat message model.
   * @param message Firestore message.
   * @param author Author of the message.
   */
  public fromDto(message: FirestoreChatMessage, author: User): Message {
    if (FirestoreChatMessageTypes.isTextMessage(message)) {
      return this.mapTextMessageFromDto(message, author);
    } else if (FirestoreChatMessageTypes.isAnnounceMessage(message)) {
      return this.mapAnnounceMessageFromDto(message, author);
    }

    // Return unsupported message.
    return new UnsupportedMessage({
      author,
      created: firestoreChatMessageDateToNumber(message.created),
      id: message.id,
    });
  }

  /**
   * Map domain chat message to firestore message.
   * @param message Chat message.
   */
  public toDto(message: Message): FirestoreChatMessage {
    if (ChatMessageTypes.isTextMessage(message)) {
      return this.mapTextMessageToDto(message);
    } else if (ChatMessageTypes.isAnnounceMessage(message)) {
      return this.mapAnnounceMessageToDto(message);
    }
    console.warn(new Error(`Unexpected message type: ${JSON.stringify(message)}`));
    return this.mapUnsupportedMessageToDto(message);
  }

  private mapAnnounceMessageToDto(message: AnnounceMessage): FirestoreChatMessage {
    return {
      authorId: message.author.id.toString(),
      created: firestore.Timestamp.fromDate(message.created),
      text: message.text,
      type: 'announce',
      id: message.id,
    } as FirestoreAnnounceMessage;
  }

  private mapUnsupportedMessageToDto(message: UnsupportedMessage): FirestoreChatMessage {
    return {
      authorId: message.author.id.toString(),
      created: firestore.Timestamp.fromDate(message.created),
      id: message.id,
    } as FirestoreAnnounceMessage;
  }

  private mapAnnounceMessageFromDto(message: FirestoreAnnounceMessage, author: User): AnnounceMessage {
    return new AnnounceMessage({
      author,
      created: firestoreChatMessageDateToNumber(message.created),
      id: message.id,
      text: message.text,
    });
  }

  private mapTextMessageFromDto(message: FirestoreChatTextMessage, author: User): TextMessage {
    return new TextMessage({
      author,
      created: firestoreChatMessageDateToNumber(message.created),
      id: message.id,
      text: message.text,
      files: message.files,
    });
  }

  private mapTextMessageToDto(message: TextMessage): FirestoreChatTextMessage {
    return {
      authorId: message.author.id.toString(),
      created: firestore.Timestamp.fromDate(message.created),
      text: message.text,
      type: 'text',
      id: message.id,
      files: message.files,
    } as FirestoreChatTextMessage;
  }
}

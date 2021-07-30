import { FirestoreChatMessage } from './firestore-chat-message';

/**
 * Firestore text message attachment.
 */
export interface FirestoreTextMessageAttachment {
  /** Attachment title. */
  title: string;
  /** Attachment url. */
  url: string;
}

/** Firestore text message dto model. */
export interface FirestoreChatTextMessage extends FirestoreChatMessage {
  /** Message text. */
  text: string;
  /** Attached files. */
  files: FirestoreTextMessageAttachment[];
  /** Announce message type. */
  readonly type: 'text';
}

/** Firestore announce emssage dto. */
export interface FirestoreAnnounceMessage extends FirestoreChatMessage {
  /** Announce text. */
  readonly text: string;
  /** Announce message type. */
  readonly type: 'announce';
}

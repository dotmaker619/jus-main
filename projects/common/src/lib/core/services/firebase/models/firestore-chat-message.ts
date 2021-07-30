import { firestore } from 'firebase/app';

/** Chat message type. */
export type FirestoreChatMessageType = 'text' | 'announce';

/**
 * Firestore chat message date DTO.
 * {firestore.Timestamp} for retrieved data from firestore.
 * {firestore.FieldValue} for set server timestamp as a value using `firestore.FieldValue.serverTimestamp()`.
 * {number} for backward compatibility.
 */
export type FirestoreChatMessageDateDto = firestore.Timestamp | firestore.FieldValue | number;

/**
 * Firestore chat message model.
 */
export interface FirestoreChatMessage {
  /**
   * ID.
   */
  id?: string;
  /**
   * Date created.
   */
  created: FirestoreChatMessageDateDto;
  /**
   * Type.
   */
  type: FirestoreChatMessageType;
  /**
   * Author ID.
   */
  authorId: string;
}

/**
 * Convert firestore message date to JS Date.
 * @param date Firestore message date.
 */
export function firestoreChatMessageDateToNumber(date: FirestoreChatMessageDateDto): Date | null {
  if (date == null) {
    // If the date is not presented, the message is likely to be new
    return new Date();
  }
  if (typeof date === 'number') {
    return new Date(date);
  }
  if (date instanceof firestore.Timestamp) {
    return new Date(date.toDate().valueOf());
  }
  throw new Error('Could not convert firestore chat message date to JS timestamp');
}

/**
 * Firestore chat document fields.
 */
export interface FirestoreChatFields {
  /**
   * Participants.
   */
  participants: number[];
}

/**
 * Firestore chat.
 */
export interface FirestoreChat extends FirestoreChatFields {
  /**
   * ID.
   */
  id: string;
}

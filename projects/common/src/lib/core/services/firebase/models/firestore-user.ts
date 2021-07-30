/**
 * Firestore user chat.
 */
export interface FirestoreUserChat extends FirestoreUserChatFields {
  /**
   * Chat ID.
   */
  chatId: string;
}

/**
 * Firestore user chat statistic document fields.
 */
export interface FirestoreUserChatFields {
  /**
   * Count unread.
   */
  count_unread: number;
  /**
   * First name another participant.
   */
  first_name_another_participant: string;
  /**
   * Last name another participant.
   */
  last_name_another_participant: string;
  /**
   * Last read message ID.
   */
  last_read_post: string;
  /**
   * Last chat message text.
   */
  last_chat_message_text: string;
  /**
   * Last chat message date.
   */
  last_chat_message_date: number;
}

/**
 * Firestore user document fields.
 */
// tslint:disable-next-line: no-empty-interface
export interface FirestoreUserFields {
}

/**
 * Firestore user.
 */
export interface FirestoreUser extends FirestoreUserFields {
  /**
   * ID.
   */
  id: string;
}

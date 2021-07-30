/**
 * Notification types.
 * @see NotificationTypeDto Notification type dto.
 */
export enum NotificationType {
  /** Attorney created a post. */
  NewAttorneyPost = 'NewAttorneyPost',
  /** Attorney created an event. */
  NewEvent = 'NewEvent',
  /** Attorney uploaded a document. */
  DocumentShared = 'DocumentShared',
  /** New message. */
  NewMessage = 'NewMessage',
  /** Matter status updated. */
  MatterStatusUpdated = 'MatterStatusUpdated',
  /** Chat created. */
  NewChat = 'NewChat',
  /** New opportunity for attorney. */
  NewOpportunity = 'NewOpportunity',
  /** New post created by attorney. */
  NewTopicPost = 'NewTopicPost',
  /** Video call started. */
  NewVideoCall = 'NewVideoCall',
  /** Attorney was invited to group chat. */
  NewGroupChat = 'NewGroupChat',
  /** Matter was shared with user. */
  MatterShared = 'MatterShared',
}

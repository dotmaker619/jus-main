/** Notification types dto. */
export type NotificationTypeDto =
  'new_attorney_post' | // Attorney created a post.
  'new_attorney_event' | // Attorney created an event.
  'document_shared_by_attorney' | // Attorney uploaded a document.
  'new_message' | // New message.
  'matter_status_update' | // Matter status updated.
  'new_chat' | // Chat created.
  'new_opportunities' | // New opportunity for attorney.
  'new_post' | // New post created by attorney.
  'new_video_call' | // Video call started.
  'new_group_chat' | // Attorney was invited to the group chat.
  'new_matter_shared'; // Matter is shared for the user.

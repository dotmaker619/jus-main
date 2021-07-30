import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { TextMessage, Attachment } from '@jl/common/core/models/chat/text-message';

/**
 * Text message component.
 */
@Component({
  selector: 'jlc-chat-text-message',
  templateUrl: './chat-text-message.component.html',
  styleUrls: ['./chat-text-message.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatTextMessageComponent {
  /** Current message. */
  @Input()
  public message: TextMessage;

  /**
   * Trackby function.
   * @param attachment Message attachment.
   */
  public trackAttachment(_: number, attachment: Attachment): string {
    // Since url is likely to be unique - we use it for tracking.
    return attachment.url;
  }
}

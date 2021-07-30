import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { UnsupportedMessage } from '@jl/common/core/models/chat/unsupported-message';

/**
 * Unsupported chat message component.
 */
@Component({
  selector: 'jlc-chat-unsupported-message',
  templateUrl: './chat-unsupported-message.component.html',
  styleUrls: ['./chat-unsupported-message.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatUnsupportedMessageComponent {
  /**
   * Message.
   */
  @Input()
  public message: UnsupportedMessage;
}

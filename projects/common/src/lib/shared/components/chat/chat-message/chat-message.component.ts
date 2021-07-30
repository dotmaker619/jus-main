import { ElementRef, Input, Component, ChangeDetectionStrategy } from '@angular/core';
import { Message } from '@jl/common/core/models/chat/message';
import { ChatMessageTypes } from '@jl/common/core/models/chat/message-type';

/**
 * Chat message component.
 * Provides ability to render any chat message type.
 */
@Component({
  selector: 'jlc-chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatMessageComponent {

  /**
   * Offset top position.
   */
  public get offsetTop(): number {
    return this.elementRef.nativeElement.offsetTop;
  }

  /**
   * Offset height.
   */
  public get offsetHeight(): number {
    return this.elementRef.nativeElement.offsetHeight;
  }

  /**
   * @constructor
   * @param elementRef Element reference.
   */
  public constructor(private elementRef: ElementRef<HTMLElement>) {
  }

  /**
   * Chat message.
   */
  @Input()
  public message: Message;

  /** Checks whether the message is text. */
  public readonly isTextMessage = ChatMessageTypes.isTextMessage;

  /** Checks whether the message is text. */
  public readonly isAnnounceMessage = ChatMessageTypes.isAnnounceMessage;

  /**
   * Scroll into view.
   */
  public scrollIntoView(): void {
    this.elementRef.nativeElement.scrollIntoView();
  }
}

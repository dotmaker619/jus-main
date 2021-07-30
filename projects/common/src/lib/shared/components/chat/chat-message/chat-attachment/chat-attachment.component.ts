import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Attachment } from '@jl/common/core/models/chat/text-message';

/** Document message component. */
@Component({
  selector: 'jlc-chat-attachment',
  templateUrl: './chat-attachment.component.html',
  styleUrls: ['./chat-attachment.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatAttachmentComponent {

  /** Attachment. */
  @Input()
  public attachment: Attachment;
}

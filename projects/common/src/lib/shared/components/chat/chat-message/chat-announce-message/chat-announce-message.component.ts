import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { AnnounceMessage } from '@jl/common/core/models/chat/announce-message';

/** Announce message component. */
@Component({
  selector: 'jlc-chat-announce-message',
  templateUrl: './chat-announce-message.component.html',
  styleUrls: ['./chat-announce-message.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatAnnounceMessageComponent {
  /** Announce message. */
  @Input()
  public message: AnnounceMessage;
}

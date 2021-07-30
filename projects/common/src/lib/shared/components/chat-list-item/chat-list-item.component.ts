import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { NetworkChatInfo } from '@jl/common/core/models/network-chat-info';

/** Chat list item component. */
@Component({
  selector: 'jlc-chat-list-item',
  templateUrl: './chat-list-item.component.html',
  styleUrls: ['./chat-list-item.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatListItemComponent {
  /** Chat info. */
  @Input()
  public chat: NetworkChatInfo;
}

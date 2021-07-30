import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { LeadChatInfo } from '@jl/common/core/models';

/**
 * Active leads list.
 */
@Component({
  selector: 'jlat-dashboard-active-leads-list',
  templateUrl: './dashboard-active-leads-list.component.html',
  styleUrls: ['./dashboard-active-leads-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardActiveLeadsListComponent {

  /**
   * List title.
   */
  @Input()
  public title: string;

  /**
   * Active leads.
   */
  @Input()
  public chats: LeadChatInfo[] = [];

  /**
   * Track chats list by chat ID.
   *
   * @param chat Chat.
   */
  public trackByChatId(_: number, chat: LeadChatInfo): string {
    return chat.id;
  }
}

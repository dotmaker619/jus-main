import { Injectable } from '@angular/core';
import { Observable, of, combineLatest } from 'rxjs';
import { map, switchMap, shareReplay, tap, take, filter, first } from 'rxjs/operators';

import { Topic, LeadChatInfo, Lead, Client } from '../../models';
import { Attorney } from '../../models/attorney';
import { ChatInfo } from '../../models/chat-info';
import { Message } from '../../models/chat/message';
import { Role } from '../../models/role';
import { User } from '../../models/user';
import { LeadsService } from '../attorney/leads.service';
import { CurrentUserService } from '../current-user.service';

import { ChatService } from './chat.service';

/**
 * Service for handling chats related to leads (for both client and attorney).
 */
@Injectable({
  providedIn: 'root',
})
export class LeadChatService {

  /** Lead chats for current user. */
  private readonly currentUserChats$: Observable<LeadChatInfo[]>;

  /**
   * @constructor
   * @param chatService
   * @param leadsService
   * @param userService
   */
  public constructor(
    private readonly chatService: ChatService,
    private readonly leadsService: LeadsService,
    private readonly userService: CurrentUserService,
  ) {
    this.currentUserChats$ = this.createCurrentUserChatStream();
  }

  // Override methods of base class

  /** @inheritdoc */
  public getCurrentUserChats(): Observable<LeadChatInfo[]> {
    return this.currentUserChats$;
  }

  /** @inheritdoc */
  protected sendMessage(chat: LeadChatInfo, message: Message): Observable<void> {
    const createChat$ = this.createChatWith(chat.recipient).pipe(
      tap(({ id: chatId }) => chat.id = chatId), // Modify outer chat info with chatId
    );
    // If this is a placeholder chat then create chat before send.
    const chat$ = chat.id != null ? of(chat) : createChat$;

    return chat$.pipe(
      switchMap(chatToSendMessage =>
        this.chatService.sendMessage(chatToSendMessage, message)),
    );
  }

  /**
   * Create chat between current user and specific recipient.
   * @param recipient Recipient
   * @param topic Topic from which chat was initiated
   */
  public createChatWith(recipient: User, topic: Topic = null): Observable<LeadChatInfo> {
    // Before start chatting we need to create a lead.
    return this.userService.currentUser$.pipe(
      first(),
      switchMap(currentUser => this.createLeadForChatting(currentUser, recipient, topic)),
      switchMap(lead => this.getChatById(lead.chatId)),
      take(1),
    );
  }

  private getChatById(chatId: string): Observable<LeadChatInfo> {
    return this.currentUserChats$.pipe(
      map(chats => chats.find(chat => chat.id === chatId)),
      filter(chat => chat != null),
      first(),
    );
  }

  // Lead-specific functionality

  /**
   * Create lead to start chatting.
   * @param sender Current user.
   * @param recipient Recipient.
   * @param topic Provide topic data from which chat was initiated.
   */
  private createLeadForChatting(sender: User, recipient: User, topic: Topic = null): Observable<Lead> {
    const participants = [sender, recipient];
    const client = participants.find(user => user.role === Role.Client) as Client;
    const attorney = participants.find(user => user.role === Role.Attorney) as Attorney;

    if (client == null || attorney == null) {
      throw new Error('Chatting is permitted only between an Attorney and a Client');
    }

    return this.leadsService.createLead(client, attorney, topic);
  }

  private createCurrentUserChatStream(): Observable<LeadChatInfo[]> {
    const currentUser$ = this.userService.currentUser$.pipe(
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
    const leads$ = currentUser$.pipe(
      filter(user => !!user),
      switchMap(user => this.leadsService.getLeadsConnectedWith(user)),
    );

    return combineLatest(this.chatService.currentChats$, leads$).pipe(
      map(([firestoreChats, leads]) =>
        firestoreChats.reduce((chats, chat) => {
          const lead = leads.find(l => l.chatId === chat.id);
          return lead ? chats.concat(this.mapLeadToChat(lead, chat)) : chats;
        }, [] as LeadChatInfo[]),
      ),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
  }

  private mapLeadToChat(lead: Lead, chat: ChatInfo): LeadChatInfo {
    // Get chat recipient relative on current user.
    const recipient = lead.attorney.id === chat.sender.id
      ? lead.client
      : lead.attorney;
    return new LeadChatInfo({
      lead,
      recipients: [new User(recipient)],
      created: lead.created,
      id: lead.chatId,
      sender: chat.sender,
      lastMessageText: chat == null ? null : chat.lastMessageText,
      lastMessageDate: chat == null || chat.lastMessageDate == null
        ? null
        : new Date(chat.lastMessageDate),
      lastReadMessageId: chat == null ? null : chat.lastReadMessageId,
      countUnreadMessages: chat == null ? 0 : chat.countUnreadMessages,
      lastActivityDate: new Date(),
    });
  }
}

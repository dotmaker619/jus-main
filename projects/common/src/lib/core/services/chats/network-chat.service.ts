import { Injectable } from '@angular/core';
import { Observable, combineLatest, EMPTY } from 'rxjs';
import { map, switchMap, switchMapTo, mapTo, withLatestFrom, first, take } from 'rxjs/operators';

import { ChatInfo } from '../../models/chat-info';
import { AnnounceMessage } from '../../models/chat/announce-message';
import { Network } from '../../models/network';
import { NetworkChatInfo } from '../../models/network-chat-info';
import { User } from '../../models/user';
import { CurrentUserService } from '../current-user.service';
import { NetworksService } from '../networks.service';

import { ChatService } from './chat.service';

/**
 * Network chat service. (Group Chats)
 * By network we mean the group of attorneys.
 */
@Injectable({ providedIn: 'root' })
export class NetworkChatService {

  /**
   * @constructor
   * @param chatService
   * @param networksService
   * @param userService
   */
  public constructor(
    private readonly chatService: ChatService,
    private readonly networksService: NetworksService,
    protected readonly userService: CurrentUserService,
  ) { }

  /**
   * Get chat for network.
   * @param network Network.
   */
  public getChatForNetwork(network: Network): Observable<NetworkChatInfo> {
    return this.chatService.currentChats$.pipe(
      map((firestoreChats) => this.mapNetworkChat(
        firestoreChats.find(chat => chat.id === network.chatId),
        network,
      )),
    );
  }

  /**
   * Update network name and send an announce to a chat.
   * @param networkChat Network to update.
   * @param newTitle New title for a network
   */
  public updateNetworkNameWithAnnounce(
    networkChat: NetworkChatInfo, newTitle: string,
  ): Observable<void> {
    return this.networksService.updateNetworkName(
      networkChat.network, newTitle,
    ).pipe(
      first(),
      withLatestFrom(this.userService.currentUser$),
      switchMap(([_, user]) =>
        this.chatService.sendMessage(
          networkChat,
          this.createRenameAnnounce(newTitle, user),
        )),
    );
  }

  /**
   * Get network chats for current user.
   * @param query Query.
   */
  public getCurrentChats(query?: string): Observable<NetworkChatInfo[]> {
    return combineLatest([
      this.networksService.getNetworks({ query }),
      this.chatService.currentChats$,
      this.userService.currentUser$,
    ]).pipe(
      map(([networks, chats]) =>
      /**
         * Having the array of networks and array of firebase chats,
         *  we only need the intersection of them.
         */
        chats.reduce((acc, chat) => {
          // Firstly, we're looking for a network related to chat
          const chatNetwork = networks.items.find(n => n.chatId === chat.id);

          // The chat might be deleted on backend, check the case
          if (chatNetwork == null) {
            // If chat is deleted, we don't need the network, because it has no chat
            return acc;
          }
          // If firebase chat is ok, add the network with chat to an array
          return acc.concat(
            this.mapNetworkChat(
              chat,
              chatNetwork,
            ));
        }, [] as NetworkChatInfo[]),
      ),
    );
  }

  /**
   * Invite person to a network.
   * @param users Users to invite.
   * @param network Network.
   */
  public inviteToNetwork(users: User[], network: Network, message: string): Observable<void> {

    return this.networksService.invitePeople(network, {
      message,
      participants: users,
    }).pipe(
      switchMapTo(this.getChatForNetwork(network)),
      first(),
      withLatestFrom(this.userService.currentUser$),
      switchMap(([chatInfo, currentUser]) => {
        /**
         * Since we send all list of recipients every time,
         *  filter for only those who were invited the last time.
         */
        const invitedUsers = users.filter(u => !chatInfo.recipients.some(r => u.id === r.id));
        const announce = this.createInvitationAnnounce(invitedUsers, currentUser);
        return this.chatService.sendMessage(chatInfo, announce);
      }),
      take(1),
      mapTo(void 0),
    );
  }

  /**
   * Create announce message for the invitation.
   * @param users Invited users.
   * @param author The person who invited.
   */
  private createInvitationAnnounce(users: User[], author: User): AnnounceMessage {
    const verb = users.length > 1 ? 'were' : 'was';
    const text = `${users.map(u => u.fullName).join(', ')} ${verb} invited by ${author.fullName}`;
    return new AnnounceMessage({
      author,
      text,
      created: new Date(),
    });
  }

  /**
   * Create announce message for renaming the chat.
   * @param newTitle New title of a chat.
   * @param author The person who renamed the chat.
   */
  private createRenameAnnounce(newTitle: string, author: User): AnnounceMessage {
    const text = `Network has been renamed to "${newTitle}" by ${author.fullName}`;
    return new AnnounceMessage({
      created: new Date(),
      author,
      text,
    });
  }

  private mapNetworkChat(chatInfo: ChatInfo, network: Network): NetworkChatInfo {
    return new NetworkChatInfo({
      ...chatInfo,
      network,
      recipients: network.participants.map(participant => new User(participant)),
    });
  }
}

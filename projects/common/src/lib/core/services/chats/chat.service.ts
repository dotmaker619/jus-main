import { Injectable } from '@angular/core';
import { forkJoin, Observable, of, OperatorFunction } from 'rxjs';
import { map, mapTo, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { MessageMapper } from '../../mappers/message.mapper';
import { ChatInfo } from '../../models/chat-info';
import { Message } from '../../models/chat/message';
import { Attachment, TextMessage } from '../../models/chat/text-message';
import { CursorPagination, CursorPaginationDirection } from '../../models/cursor-pagination';
import { User } from '../../models/user';
import { AppConfigService } from '../app-config.service';
import { CurrentUserService } from '../current-user.service';
import { FileStorageService } from '../file-storage.service';
import { FirestoreChatsService } from '../firebase/firestore-chats.service';
import { FirestoreChatMessage } from '../firebase/models/firestore-chat-message';
import { FirestoreUserChat } from '../firebase/models/firestore-user';
import { UsersService } from '../users.service';

/** Chats feature disabled error message. */
export const CHATS_FEATURE_DISABLED_MESSAGE = 'Chats feature is disabled';
const DEFAULT_PAGE_LIMIT = 30;

/** Base chat functionality.  */
@Injectable({ providedIn: 'root' })
export class ChatService {
  /** Message mapper. */
  private readonly messageMapper = new MessageMapper();
  /** Current firestore chats. */
  private readonly firestoreChats$: Observable<FirestoreUserChat[]>;
  /** Cached users to provide to message models. */
  private readonly cachedRecipients = new Map<number, User>();

  /** Current chats. */
  public readonly currentChats$: Observable<ChatInfo[]>;

  /**
   * @constructor
   * @param firebaseChatsService Firebase service.
   * @param userService User service.
   * @param usersService Users service to obtain list of users.
   * @param appConfigService Application config service.
   * @param notificationsService Notifications service.
   */
  public constructor(
    private readonly firebaseChatsService: FirestoreChatsService,
    private readonly appConfigService: AppConfigService,
    private readonly fileStorageService: FileStorageService,
    private readonly userService: CurrentUserService,
    private readonly usersService: UsersService,
  ) {
    if (!this.appConfigService.chatsEnabled) {
      console.warn(CHATS_FEATURE_DISABLED_MESSAGE);
    }
    this.firestoreChats$ = this.initFirestoreChatsStream();
    this.currentChats$ = this.initChatInfoStream();
  }

  /**
   * Send message to a chat.
   * @param chat Chat to which we want to send a message.
   * @param message Message.
   */
  public sendMessage(chat: ChatInfo, message: Message): Observable<void> {
    if (!this.appConfigService.chatsEnabled) {
      throw new Error(CHATS_FEATURE_DISABLED_MESSAGE);
    }
    return this.firebaseChatsService.addMessageToChat(
      chat.id,
      this.messageMapper.toDto(message),
    );
  }

  /**
   * Get page of messages for the chat.
   * When page is `null` (default) method returns the very first page.
   *
   * @param chat Chat info.
   * @param pageToStart Page to start from.
   * @param direction Direction to load the next page.
   * @param limit Limit of messages for the page.
   */
  public getMessagesPage(
    chat: ChatInfo,
    pageToStart?: CursorPagination<Message>,
    direction: CursorPaginationDirection = 'tail',
    limit: number = DEFAULT_PAGE_LIMIT,
  ): Observable<CursorPagination<Message>> {
    const messageToStartFrom =
      pageToStart &&
      pageToStart.items.length &&
      direction &&
      this.messageMapper.toDto(
        this.obtainMessageToStartFrom(pageToStart, direction),
      );

    let messages$: Observable<FirestoreChatMessage[]>;
    if (messageToStartFrom == null) {
      messages$ = this.firebaseChatsService.getMessagesFromStart(
        chat.id,
        limit,
      );
    } else if (direction === 'head') {
      messages$ = this.firebaseChatsService.getMessagesBeforeAnother(
        chat.id,
        limit,
        messageToStartFrom,
      );
    } else {
      messages$ = this.firebaseChatsService.getMessagesAfterAnother(
        chat.id,
        limit,
        messageToStartFrom,
      );
    }

    return messages$.pipe(
      this.cacheUsersFromMessages(),
      map((messages) => {
        const pageIsFull = messages.length === limit;
        const items = messages.map((m) => this.mapFirestoreMessage(m, chat));

        return {
          items,
          next: direction === 'head' || pageIsFull,
          prev: direction === 'tail' || pageIsFull,
          position: direction,
        } as CursorPagination<Message>;
      }),
    );
  }

  /**
   * Get page of messages on which last read message is presented.
   * @param chatInfo Chat info.
   */
  public getMessagesPageWithLastRead(
    chatInfo: ChatInfo,
  ): Observable<CursorPagination<Message>> {
    if (chatInfo.lastReadMessageId == null) {
      // If no last read message, obtain first page of messages
      return this.getMessagesPage(chatInfo);
    }
    return this.firebaseChatsService
      .getMessagesPageWithLastRead(chatInfo.id, DEFAULT_PAGE_LIMIT)
      .pipe(
        this.cacheUsersFromMessages(),
        map((items) => items.map((i) => this.mapFirestoreMessage(i, chatInfo))),
        map((items) => ({
          /**
           * Page with last read might be anywhere in the list of items,
           *  so we may assume there might be more to load on every direction.
           */
          next: true,
          prev: true,
          position: null,
          items,
        })),
      );
  }

  /**
   * Get the last page from pagination.
   * @param chatInfo Chat info.
   */
  public getLastPageMessages(
    chatInfo: ChatInfo,
  ): Observable<CursorPagination<Message>> {
    return this.firebaseChatsService
      .getMessagesFromEnd(chatInfo.id, DEFAULT_PAGE_LIMIT)
      .pipe(
        this.cacheUsersFromMessages(),
        map((items) => items.map((i) => this.mapFirestoreMessage(i, chatInfo))),
        map((items) => ({
          next: false,
          prev: true,
          position: null,
          items,
        })),
      );
  }

  /**
   * Get messages observable after specified message.
   * @param chat Chat info.
   * @param message Last message from which we want to observe new ones.
   */
  public getHotMessages(
    chat: ChatInfo,
    message?: Message,
  ): Observable<Message[]> {
    return this.firebaseChatsService
      .getHotMessages(chat.id, message && this.messageMapper.toDto(message))
      .pipe(
        map((messages) =>
          messages.map((m) => this.mapFirestoreMessage(m, chat)),
        ),
      );
  }

  /**
   * Send chat to specific chat.
   * @param chat Chat.
   * @param messageText Message text.
   * @param attachmentDocs Attachments of a message.
   */
  public sendTextMessage(
    chat: ChatInfo,
    messageText: string,
    attachmentDocs: File[] = [],
  ): Observable<void> {
    // Prepare attachment for message.
    const files$ = this.prepareAttachmentStream(attachmentDocs);
    return files$.pipe(
      switchMap((files) => {
        const message = new TextMessage({
          author: chat.sender,
          created: new Date(),
          isMyMessage: true,
          text: messageText,
          files,
        });

        return this.sendMessage(chat, message);
      }),
    );
  }

  /**
   * Upload files to s3 and get Attachment array.
   * @param files Message attachment files.
   */
  public prepareAttachmentStream(files: File[]): Observable<Attachment[]> {
    if (!files.length) {
      return of([]);
    }

    return forkJoin(
      files.map((file) =>
        this.fileStorageService
          .uploadChatAttachment(file)
          .pipe(map((url) => ({ title: file.name, url } as Attachment))),
      ),
    );
  }

  /**
   * Set last read message for current user in chat with specific recipient.
   * @param chat Chat to set last read message.
   * @param message Last read message.
   */
  public setLastReadMessage(
    chat: ChatInfo,
    message: Message,
  ): Observable<void> {
    if (!this.appConfigService.chatsEnabled) {
      throw new Error(CHATS_FEATURE_DISABLED_MESSAGE);
    }
    return this.firebaseChatsService.setLastReadMessageForCurrentUser(
      chat.id,
      this.messageMapper.toDto(message),
    );
  }

  /** Sort chats by last activity date. The latest chats would be first. */
  private sortChats(this: void, a: ChatInfo, b: ChatInfo): number {
    const aDate = (a.lastActivityDate && a.lastActivityDate.valueOf()) || 0;
    const bDate = (b.lastActivityDate && b.lastActivityDate.valueOf()) || 0;

    return bDate - aDate;
  }

  private initChatInfoStream(): Observable<ChatInfo[]> {
    return this.firestoreChats$.pipe(
      withLatestFrom(this.userService.currentUser$),
      map(([chats, currentUser]) =>
        chats.map((chat) => this.mapFirestoreChat(chat, currentUser)),
      ),
      map((chats) => chats.sort(this.sortChats)),
    );
  }

  private mapFirestoreChat(
    this: void,
    firestoreChat: FirestoreUserChat,
    currentUser: User,
  ): ChatInfo {
    return new ChatInfo({
      countUnreadMessages: firestoreChat.count_unread,
      lastMessageDate:
        firestoreChat.last_chat_message_date &&
        new Date(firestoreChat.last_chat_message_date),
      lastMessageText: firestoreChat.last_chat_message_text,
      lastReadMessageId: firestoreChat.last_read_post,
      sender: currentUser,
      id: firestoreChat.chatId,
    });
  }

  private obtainMessageToStartFrom(
    page: CursorPagination<Message>,
    directionToLoad: CursorPaginationDirection,
  ): Message | null {
    const items = page.items;
    // If direction is to the tail, get the last message from the page and vice versa
    return directionToLoad === 'tail' ? items[items.length - 1] : items[0];
  }

  private cacheUsersFromMessages(): OperatorFunction<
    FirestoreChatMessage[],
    FirestoreChatMessage[]
  > {
    return switchMap((messages) => {
      const messageAuthorIds = messages.map(({ authorId }) => authorId);
      return this.obtainUncachedUsers(messageAuthorIds).pipe(mapTo(messages));
    });
  }

  private obtainUncachedUsers(ids: string[]): Observable<void> {
    const uniqueIds = Array.from(new Set(ids.map((id) => parseInt(id, 10))));
    const notCachedRecipients = uniqueIds.filter(
      (id) => this.cachedRecipients.get(id) == null,
    );
    if (notCachedRecipients.length === 0) {
      return of(null);
    }
    return this.usersService.getUsersByIds(notCachedRecipients).pipe(
      tap((users) =>
        users.forEach((user) => this.cachedRecipients.set(user.id, user)),
      ),
      mapTo(null),
    );
  }

  private mapFirestoreMessage(
    firestoreMessage: FirestoreChatMessage,
    chat: ChatInfo,
  ): Message {
    const messageAuthorId = parseInt(firestoreMessage.authorId, 10);
    const isMyMessage = chat.sender.id === messageAuthorId;
    const author = this.cachedRecipients.get(messageAuthorId);

    const message = this.messageMapper.fromDto(firestoreMessage, author);
    message.isMyMessage = isMyMessage;

    return message;
  }

  private initFirestoreChatsStream(): Observable<FirestoreUserChat[]> {
    return this.firebaseChatsService.currentUserChats$;
  }
}

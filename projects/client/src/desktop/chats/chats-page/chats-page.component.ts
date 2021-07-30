import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Topic } from '@jl/common/core/models';
import { LeadChatInfo } from '@jl/common/core/models/lead-chat-info';
import { LeadChatService } from '@jl/common/core/services/chats/lead-chat.service';
import { TopicsService } from '@jl/common/core/services/topics.service';
import { UsersService } from '@jl/common/core/services/users.service';
import { Observable, combineLatest, NEVER, from, of } from 'rxjs';
import { map, switchMap, switchMapTo, first, share, exhaustMap, shareReplay } from 'rxjs/operators';

/**
 * Chat page.
 */
@Component({
  selector: 'jlcl-chats-page',
  templateUrl: './chats-page.component.html',
  styleUrls: ['./chats-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatsPageComponent {
  /**
   * Current user chats.
   */
  public readonly chats$: Observable<LeadChatInfo[]>;

  /**
   * Selected chat.
   */
  public readonly selectedChat$: Observable<LeadChatInfo>;

  /**
   * @constructor
   * @param leadsService Leads service.
   * @param chatService Chat service.
   */
  public constructor(
    private readonly chatService: LeadChatService,
    private readonly topicsService: TopicsService,
    private readonly usersService: UsersService,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
  ) {
    this.chats$ = this.createChatsStream();
    this.selectedChat$ = this.createSelectedChatStream();
  }

  private createSelectedChatStream(): Observable<LeadChatInfo> {
    const selectedChatId$ = this.activatedRoute.queryParamMap
      .pipe(
        map(paramMap => paramMap.get('chatId')),
      );

    return combineLatest([selectedChatId$, this.chats$])
      .pipe(
        switchMap(([selectedChatId, chats]) => {
          const selectedChat = chats.find(chat => chat.id === selectedChatId);
          if (selectedChat == null) {
            // If selected chat is not specified or does not exit then redirect to first.
            if (chats.length === 0) {
              return NEVER;
            }
            const [chatRedirectTo] = chats;
            // Redirect to to the same route with different query params.
            return this.navigateToChat(chatRedirectTo)
              .pipe(
                switchMapTo(NEVER), // Stop current stream because it will be restarted after activateRoute params change.
              );
          }
          return of(selectedChat);
        }),
      );
  }

  /**
   * Create a chat stream.
   * @description If query param "attorneyId" is provided then try to find a chat with this attorney
   * or create a new chat if chat with this attorney does not exist.
   */
  private createChatsStream(): Observable<LeadChatInfo[]> {
    const attorneyId = parseInt(this.activatedRoute.snapshot.queryParamMap.get('attorneyId'), 10); // Only for initialization.
    const topicId = parseInt(this.activatedRoute.snapshot.queryParamMap.get('topicId'), 10);

    const chats$ = this.chatService.getCurrentUserChats()
      .pipe(
        map(chats => chats.sort((a, b) => b.created.valueOf() - a.created.valueOf())), // Newest on top.
        share(),
      );

    /**
     * if not attorney or topic provided just return all user chats.
     */
    if (attorneyId == null || Number.isNaN(attorneyId)) {
      return chats$ // Nothing to do, just return a stream of chats.
        .pipe(
          shareReplay({
            bufferSize: 1,
            refCount: true,
          }),
        );
    }

    return chats$
      .pipe(
        first(), // Only for initialization.
        exhaustMap(chats => {
          // Try to find a chat by attorney.
          const attorneyChat = chats.find(chat => chat.recipient.id === attorneyId);
          if (attorneyChat == null) {
            // Create a new chat.
            // Provide topic data if topic id was passed.
            let topicData$: Observable<Topic>;
            if (topicId == null || Number.isNaN(topicId)) {
              topicData$ = of(null);
            } else {
              topicData$ = this.topicsService.getTopicById(topicId);
            }
            return combineLatest(
              this.usersService.getAttorneyById(attorneyId),
              topicData$,
            )
              .pipe(
                switchMap(([attorney, topic]) => this.chatService.createChatWith(attorney, topic)),
                first(),
                switchMap(newChat => this.navigateToChat(newChat)),
                switchMapTo(chats$),
              );
          }
          // If found then redirect to it.
          return this.navigateToChat(attorneyChat)
            .pipe(
              switchMapTo(chats$),
            );
        }),
        shareReplay({
          bufferSize: 1,
          refCount: true,
        }),
      );
  }

  private navigateToChat(chat: LeadChatInfo): Observable<boolean> {
    // Redirect to to the same route with different query params.
    return from(this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        chatId: chat.id,
      },
      replaceUrl: true,
    }));
  }

  /**
   * Track chat by ID.
   * @param chat Chat.
   */
  public trackByChatId(chat: LeadChatInfo): string {
    return chat.id;
  }
}

import { ActivatedRoute, Router } from '@angular/router';
import { LeadChatInfo } from '@jl/common/core/models';
import { LeadChatService } from '@jl/common/core/services/chats/lead-chat.service';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { TopicsService } from '@jl/common/core/services/topics.service';
import { UsersService } from '@jl/common/core/services/users.service';
import { Observable, combineLatest, from, NEVER, of } from 'rxjs';
import { shareReplay, first, exhaustMap, switchMap, switchMapTo, skipWhile, map, distinctUntilKeyChanged } from 'rxjs/operators';

/**
 * Base class for active-leads page.
 */
export abstract class BaseActiveLeadsPage {
  /**
   * Chats of current attorney.
   */
  public readonly chats$: Observable<LeadChatInfo[]>;

  /**
   * Selected lead.
   */
  public readonly selectedChat$: Observable<LeadChatInfo>;

  /**
   * @constructor
   * @param chatService
   * @param activateRoute
   * @param userService
   * @param usersService
   * @param router
   * @param topicsService
   */
  constructor(
    protected readonly chatService: LeadChatService,
    protected readonly activateRoute: ActivatedRoute,
    protected readonly userService: CurrentUserService,
    protected readonly usersService: UsersService,
    protected readonly router: Router,
    protected readonly topicsService: TopicsService,
  ) {
    this.chats$ = this.createChatStream();
    this.selectedChat$ = this.createSelectedChatStream();
  }

  private createChatStream(): Observable<LeadChatInfo[]> {
    const clientId = parseInt(this.activateRoute.snapshot.queryParamMap.get('clientId'), 10);
    const topicId = parseInt(this.activateRoute.snapshot.queryParamMap.get('topicId'), 10);

    const chats$ = this.chatService.getCurrentUserChats();

    if (
      (clientId == null || Number.isNaN(clientId)) ||
      (topicId == null || Number.isNaN(topicId))
    ) {
      return chats$
        .pipe(
          shareReplay({
            bufferSize: 1,
            refCount: true,
          }),
        );
    }

    return chats$.pipe(
      first(),
      exhaustMap(chats => {
        const clientChat = chats.find(chat => chat.recipient.id === clientId);

        if (clientChat == null) {
          return combineLatest(
            this.usersService.getClient(clientId),
            this.topicsService.getTopicById(topicId),
          )
            .pipe(
              switchMap(([client, topic]) => this.chatService.createChatWith(client, topic)),
              first(),
              switchMap(newChat => this.navigateToLead(newChat.lead.id)),
              switchMapTo(chats$),
              skipWhile(newChats => newChats.find(chat => chat.recipient.id === clientId) == null),
            );
        }

        return this.navigateToLead(clientChat.lead.id)
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

  /**
   * Navigate to lead.
   * @param chat Chat info.
   */
  public navigateToLead(leadId: number): Observable<boolean> {
    return from(this.router.navigate([], {
      replaceUrl: true,
      relativeTo: this.activateRoute,
      queryParams: {
        leadId,
      },
    }));
  }

  private createSelectedChatStream(): Observable<LeadChatInfo> {
    const selectedLeadId$ = this.activateRoute.queryParamMap
      .pipe(
        map(paramMap => {
          const leadId = paramMap.get('leadId');
          if (leadId == null) {
            return null;
          }
          return parseInt(leadId, 10);
        }),
      );

    return combineLatest([selectedLeadId$, this.chats$])
      .pipe(
        switchMap(([selectedLeadId, chats]) => {
          const selectedChat = chats.find(chat => chat.lead.id === selectedLeadId);
          if (selectedChat == null) {
            // If selected chat is not specified or does not exit then redirect to first.
            if (chats.length === 0) {
              return NEVER;
            }
            const [chatRedirectTo] = chats;
            // Redirect to to the same route with different query params.
            return from(this.router.navigate([], {
              relativeTo: this.activateRoute,
              replaceUrl: true,
              queryParams: {
                leadId: chatRedirectTo.lead.id,
              },
            }))
              .pipe(
                switchMapTo(NEVER), // Stop current stream because it will be restarted after activateRoute params change.
              );
          }
          return of(selectedChat);
        }),
        distinctUntilKeyChanged('id'),
        shareReplay({
          bufferSize: 1,
          refCount: true,
        }),
      );
  }

  /**
   * Track chat by id.
   * @param chat Chat.
   */
  public trackByChatId(_: number, chat: LeadChatInfo): string {
    return chat.id;
  }
}

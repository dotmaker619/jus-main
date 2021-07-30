import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { DestroyableBase } from '@jl/common/core';
import { Topic } from '@jl/common/core/models';
import { LeadChatInfo } from '@jl/common/core/models/lead-chat-info';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { LeadChatService } from '@jl/common/core/services/chats/lead-chat.service';
import { TopicsService } from '@jl/common/core/services/topics.service';
import { UsersService } from '@jl/common/core/services/users.service';
import { BehaviorSubject, Observable, of, combineLatest, from } from 'rxjs';
import { map, share, shareReplay, first, exhaustMap, switchMap, switchMapTo, filter, takeUntil } from 'rxjs/operators';

import { ChatModalComponent } from '../components/chat-modal/chat-modal.component';

/** Chats page. */
@Component({
  selector: 'jlcl-chats-page',
  templateUrl: './chats-page.component.html',
  styleUrls: ['./chats-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatsPageComponent extends DestroyableBase {
  /** Chat list. */
  public readonly chats$: Observable<LeadChatInfo[]>;
  /**
   * Loading controller.
   */
  public readonly isLoading$ = new BehaviorSubject(false);

  /**
   * @constructor
   *
   * @param route Activated route.
   * @param chatService Chat service.
   * @param modalCtrl Modal controller.
   * @param usersService Users service.
   * @param topicsService Topics service.
   */
  public constructor(
    private readonly route: ActivatedRoute,
    private readonly chatService: LeadChatService,
    private readonly modalCtrl: ModalController,
    private readonly usersService: UsersService,
    private readonly topicsService: TopicsService,
    private readonly navCtrl: NavController,
  ) {
    super();
    this.chats$ = this.initChatsStream();
    this.onChatIdChange(this.chats$);
  }

  /**
   * Handle 'click' of chat item.
   * @param chat Chat info.
   */
  public onChatClick(chat: LeadChatInfo): void {
    this.navigateToChat(chat);
  }

  /**
   * TrackBy function.
   *
   * @param _ Idx.
   * @param item Chat info.
   */
  public trackChat(_: number, item: LeadChatInfo): string {
    return item.id;
  }

  /**
   * Create a chat stream.
   * @description If query param "attorneyId" is provided then try to find a chat with this attorney
   * or create a new chat if chat with this attorney does not exist.
   */
  private initChatsStream(): Observable<LeadChatInfo[]> {
    this.isLoading$.next(true);
    const attorneyId = parseInt(this.route.snapshot.queryParamMap.get('attorneyId'), 10); // Only for initialization.
    const topicId = parseInt(this.route.snapshot.queryParamMap.get('topicId'), 10);

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
          onMessageOrFailed(() => this.isLoading$.next(false)),
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
        onMessageOrFailed(() => this.isLoading$.next(false)),
      );
  }

  private onChatIdChange(chats$: Observable<LeadChatInfo[]>): void {
    const chatId$ = this.route.queryParamMap.pipe(
      map((params) => params.get('chatId')),
      filter((id) => id != null),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );

    const attorneyChat$ = combineLatest([
      chatId$,
      chats$,
    ]).pipe(
      map(([chatId, chats]) => chats.find(chat => chat.id === chatId)),
      filter(chat => chat != null),
      first(),
    );

    chatId$.pipe(
      switchMapTo(attorneyChat$),
      takeUntil(this.destroy$),
    ).subscribe(chat => this.openChat(chat));
  }

  private navigateToChat(chat: LeadChatInfo): Observable<boolean> {
    // Redirect to to the same route with different query params.
    return from(this.navCtrl.navigateForward([], {
      relativeTo: this.route,
      queryParams: {
        chatId: chat.id,
      },
    }));
  }

  private async openChat(chat: LeadChatInfo): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ChatModalComponent,
      componentProps: {
        chat: chat,
      },
    });

    modal.present();
    const res = await modal.onDidDismiss();
    if (res.data && res.data.attorneyId) {
      this.navCtrl.navigateForward(['/attorneys', 'profile', res.data.attorneyId]);
    } else {
      this.navCtrl.navigateForward([], {
        relativeTo: this.route,
        queryParams: {},
      });
    }
  }

}

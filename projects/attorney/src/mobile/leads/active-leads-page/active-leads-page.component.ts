import { Component, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { BaseActiveLeadsPage } from '@jl/attorney/shared/pages/active-leads-page';
import { LeadChatService } from '@jl/common/core/services/chats/lead-chat.service';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { TopicsService } from '@jl/common/core/services/topics.service';
import { UsersService } from '@jl/common/core/services/users.service';
import { of, Subject, combineLatest } from 'rxjs';
import { map, filter, switchMap, tap, takeUntil, first } from 'rxjs/operators';

import { ChatModalComponent } from '../modals/chat-modal/chat-modal.component';

/**
 * Active leads page for mobile workspace.
 */
@Component({
  selector: 'jlat-active-leads-page',
  templateUrl: './active-leads-page.component.html',
  styleUrls: ['./active-leads-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActiveLeadsPageComponent extends BaseActiveLeadsPage implements OnDestroy {
  private destroy$ = new Subject<void>();
  /**
   * @constructor
   * @param chatService
   * @param activateRoute
   * @param userService
   * @param usersService
   * @param router
   * @param topicsService
   * @param modalController
   */
  constructor(
    chatService: LeadChatService,
    activateRoute: ActivatedRoute,
    userService: CurrentUserService,
    usersService: UsersService,
    router: Router,
    topicsService: TopicsService,
    private readonly modalController: ModalController,
  ) {
    super(
      chatService,
      activateRoute,
      userService,
      usersService,
      router,
      topicsService,
    );

    const leadIdChange$ = this.activateRoute.queryParams.pipe(
      map(({ leadId }) => parseInt(leadId, 10)),
      filter(leadId => !Number.isNaN(leadId)),
    );

    const chats$ = this.chats$.pipe(first());

    combineLatest([
      leadIdChange$,
      chats$,
    ]).pipe(
      switchMap(([selectedLeadId, chats]) => {
        const selectedChat = chats.find(chat => chat.lead.id === selectedLeadId);
        return of(selectedChat);
      }),
      switchMap(selectedChat => this.modalController.create({
        component: ChatModalComponent,
        componentProps: {
          chat: selectedChat,
        },
      })),
      switchMap(modal => modal.present() && modal.onDidDismiss()),
      tap(() => this.navigateToLead(void 0)),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  /** @inheritdoc */
  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

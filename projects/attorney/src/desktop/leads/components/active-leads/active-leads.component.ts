import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseActiveLeadsPage } from '@jl/attorney/shared/pages/active-leads-page';
import { LeadChatService } from '@jl/common/core/services/chats/lead-chat.service';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { TopicsService } from '@jl/common/core/services/topics.service';
import { UsersService } from '@jl/common/core/services/users.service';

/**
 * Active leads tab component.
 */
@Component({
  selector: 'jlat-active-leads',
  templateUrl: './active-leads.component.html',
  styleUrls: ['./active-leads.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActiveLeadsComponent extends BaseActiveLeadsPage {
  /**
   * @constructor
   * @param chatService
   * @param activateRoute
   * @param userService
   * @param router
   * @param topicsService
   */
  constructor(
    chatService: LeadChatService,
    activateRoute: ActivatedRoute,
    userService: CurrentUserService,
    usersService: UsersService,
    router: Router,
    topicsService: TopicsService,
  ) {
    super(
      chatService,
      activateRoute,
      userService,
      usersService,
      router,
      topicsService,
    );
  }
}

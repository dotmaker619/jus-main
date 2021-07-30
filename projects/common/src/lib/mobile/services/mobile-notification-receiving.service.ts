import { Router } from '@angular/router';
import { NotificationReceivingService } from '@jl/attorney/shared/services/notification-receiving.service';
import { EventsService } from '@jl/common/core/services/attorney/events.service';
import { LeadsService } from '@jl/common/core/services/attorney/leads.service';
import { MatterPostService } from '@jl/common/core/services/attorney/matter-post.service';
import { MattersService } from '@jl/common/core/services/attorney/matters.service';
import { CallsService } from '@jl/common/core/services/calls.service';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { DocumentsService } from '@jl/common/core/services/documents.service';
import { PostService } from '@jl/common/core/services/post.service';
import { Observable } from 'rxjs';
import { switchMap, filter } from 'rxjs/operators';

import { AlertService } from './alert.service';

/** Notification receiving service for mobile app. */
export class MobileNotificationReceivingService extends NotificationReceivingService {

  /**
   * @constructor
   * @param postsService
   * @param router
   * @param eventsService
   * @param documentsService
   * @param leadsService
   * @param matterPostsService
   * @param callsService
   * @param userService
   * @param alertService
   * @param matterService
   */
  public constructor(
    postsService: PostService,
    router: Router,
    eventsService: EventsService,
    documentsService: DocumentsService,
    leadsService: LeadsService,
    matterPostsService: MatterPostService,
    callsService: CallsService,
    matterService: MattersService,
    userService: CurrentUserService,
    private readonly alertService: AlertService,
  ) {
    super(
      postsService,
      router,
      eventsService,
      documentsService,
      leadsService,
      matterPostsService,
      callsService,
      matterService,
      userService,
    );
  }

  /** @inheritdoc */
  protected navigateToNewVideoCall(callId: number): Observable<void> {
    return this.callsService.getCallInfoById(callId).pipe(
      switchMap(callInfo => this.alertService.showConfirmation({
        header: `Income Call`,
        message: callInfo.message,
        buttonText: 'Connect',
        cancelButtonText: 'Ignore',
      })),
      filter(shouldAnswer => shouldAnswer),
      switchMap(() => super.navigateToNewVideoCall(callId)),
    );
  }
}

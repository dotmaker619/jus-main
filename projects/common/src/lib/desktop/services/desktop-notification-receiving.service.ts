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
import { DialogsService } from '@jl/common/shared';
import { Observable } from 'rxjs';
import { switchMap, filter } from 'rxjs/operators';

/** Notification receiving service for desktop app. */
export class DesktopNotificationReceivingService extends NotificationReceivingService {

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
   * @param dialogsService
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
    private readonly dialogsService: DialogsService,
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
      switchMap(callInfo => this.dialogsService.showConfirmationDialog({
        title: `Income Call`,
        message: callInfo.message,
        confirmationButtonText: 'Connect',
        cancelButtonText: 'Ignore',
      })),
      filter(shouldAnswer => shouldAnswer),
      switchMap(() => super.navigateToNewVideoCall(callId)),
    );
  }
}

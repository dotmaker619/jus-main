import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationType } from '@jl/common/core/models/notification-type';
import { Role } from '@jl/common/core/models/role';
import { ShortNotification } from '@jl/common/core/models/short-notification';
import { EventsService } from '@jl/common/core/services/attorney/events.service';
import { LeadsService } from '@jl/common/core/services/attorney/leads.service';
import { MatterPostService } from '@jl/common/core/services/attorney/matter-post.service';
import { MattersService } from '@jl/common/core/services/attorney/matters.service';
import { CallsService } from '@jl/common/core/services/calls.service';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { DocumentsService } from '@jl/common/core/services/documents.service';
import { PostService } from '@jl/common/core/services/post.service';
import { Observable, of } from 'rxjs';
import { switchMap, mapTo, first, tap, map } from 'rxjs/operators';

type NotificationAction = (notification?: ShortNotification) => Observable<void>;

/**
 * Notification receiving service.
 * Handles received notifications on app.
 */
@Injectable({ providedIn: 'root' })
export class NotificationReceivingService {
  private readonly notificationActionMap: Record<NotificationType, NotificationAction> = {
    NewAttorneyPost: (n) => this.navigateToNewForumPost(n.objectId),
    NewEvent: (n) => this.navigateToNewEvent(n.objectId),
    DocumentShared: (n) => this.navigateToNewDocument(n.objectId),
    NewMessage: (n) => this.navigateToNewMatterMessage(n.objectId),
    MatterStatusUpdated: (n) => this.navigateToMatter(n.objectId),
    NewChat: (n) => this.navigateToNewChat(n.objectId),
    NewOpportunity: () => this.navigateToNewOpportunity(),
    NewTopicPost: (n) => this.navigateToNewForumPost(n.objectId),
    NewVideoCall: (n) => this.navigateToNewVideoCall(n.objectId),
    NewGroupChat: (n) => this.navigateToNewNetwork(n.objectId),
    MatterShared: (n) => this.navigateToSharedMatter(n.objectId),
  };

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
   * @param mattersService
   */
  public constructor(
    protected readonly postsService: PostService,
    protected readonly router: Router,
    protected readonly eventsService: EventsService,
    protected readonly documentsService: DocumentsService,
    protected readonly leadsService: LeadsService,
    protected readonly matterPostsService: MatterPostService,
    protected readonly callsService: CallsService,
    protected readonly mattersService: MattersService,
    protected readonly userService: CurrentUserService,
  ) { }

  /**
   * Handle opened notification.
   * @param notification Notification.
   */
  public handleOpenedNotification(
    notification: ShortNotification,
  ): Observable<ShortNotification> {
    const show = this.notificationActionMap[notification.type];
    const handle$ = show ? show(notification) : this.handleUnexpected(notification);
    return handle$.pipe(
      mapTo(notification),
    );
  }

  /**
   * Handle not opened notification.
   * @param notification Notification.
   */
  public handleNotOpenedNotification(
    notification: ShortNotification,
  ): Observable<ShortNotification> {
    /**
     * Currently, we are interested
     *  in handling only video-calls on foreground.
     *
     * (!) But any future handling of foreground notifications
     *  should be performed here.
     */
    if (notification.type === NotificationType.NewVideoCall) {
      return this.navigateToNewVideoCall(notification.objectId).pipe(
        mapTo(notification),
      );
    }
    return of(notification);
  }

  /**
   * Handle unexpected type of notification.
   * @param notification Notification.
   */
  protected handleUnexpected(notification: ShortNotification): Observable<void> {
    // Redirect on notifications page in case of unexpected notification.
    console.warn('Notification with unexpected type was opened, redirect to notifications page.', notification.type);
    return of(null).pipe(
      switchMap(() => this.router.navigateByUrl('/notifications')),
      mapTo(null),
    );
  }

  /**
   * Navigate to new forum post.
   * @param postId Forum post id.
   */
  protected navigateToNewForumPost(postId: number): Observable<void> {
    return this.postsService.getPostById(postId).pipe(
      switchMap(post => this.router.navigate(['forum', 'topic', post.topicId])),
      mapTo(null),
    );
  }

  /**
   * Navigate to new event.
   * @param eventId Event id.
   */
  protected navigateToNewEvent(eventId: number): Observable<void> {
    return this.eventsService.getEvent(eventId).pipe(
      switchMap(({ attorneyId }) => this.router.navigate(['attorneys', 'profile', attorneyId])),
      mapTo(null),
    );
  }

  /**
   * Navigate to the matter page to show a document.
   * @param documentId Document id.
   */
  protected navigateToNewDocument(documentId: number): Observable<void> {
    return this.documentsService.getDocumentById(documentId).pipe(
      switchMap(({ matter }) => this.navigateToMatter(matter.id)),
    );
  }

  /**
   * Navigate to shared matter.
   * @param referMatterId Id of refer matter entity.
   */
  protected navigateToSharedMatter(referMatterId: number): Observable<void> {
    return this.mattersService.getMatterIdByReferMatterId(referMatterId).pipe(
      switchMap(id => this.navigateToMatter(id)),
    );
  }

  /**
   * Navigate to matter page.
   * @param matterId Matter id.
   */
  protected navigateToMatter(matterId: number): Observable<void> {
    return of(null).pipe(
      switchMap(() => this.router.navigate(['matters', matterId])),
      mapTo(null),
    );
  }

  /**
   * Navigate to page with new chat.
   * @param leadId Lead id.
   */
  protected navigateToNewChat(leadId: number): Observable<void> {
    return this.userService.currentUser$.pipe(
      first(),
      switchMap(({ role }) =>
        role === Role.Attorney ?
          this.navigateAttorneyToChat(leadId) :
          this.navigateClientToChat(leadId),
      ),
    );
  }

  private navigateClientToChat(leadId: number): Observable<void> {
    return this.leadsService.getLeadById(leadId).pipe(
      map(lead => lead.attorney.id),
      switchMap(attorneyId => this.router.navigate(['chats'], {
        queryParams: {
          attorneyId,
        },
      })),
      mapTo(null),
    );
  }

  private navigateAttorneyToChat(leadId: number): Observable<void> {
    return of(null).pipe(
      switchMap(() => this.router.navigate(['leads', 'active'], {
        queryParams: {
          leadId,
        },
      })),
      mapTo(null),
    );
  }

  /**
   * Navigate to matter topic.
   * @param matterPostId Matter post id.
   */
  protected navigateToNewMatterMessage(matterPostId: number): Observable<void> {
    return this.matterPostsService.getMatterPostById(matterPostId).pipe(
      first(),
      switchMap(post => this.router.navigate(['matters', 'messages', post.topic])),
      mapTo(null),
    );
  }

  /**
   * Proceed to new video call.
   * @param callId Call id.
   */
  protected navigateToNewVideoCall(callId: number): Observable<void> {
    return this.callsService.getCallInfoById(callId).pipe(
      tap(call => this.callsService.proceedToCall(call)),
      mapTo(null),
    );
  }

  /** Navigate to new opportunity. */
  protected navigateToNewOpportunity(): Observable<void> {
    return of(null).pipe(
      switchMap(() => this.router.navigate(['leads'])),
      mapTo(null),
    );
  }

  /**
   * Navigate to new network
   *
   * @param networkId Network's ID
   */
  protected navigateToNewNetwork(networkId: number): Observable<void> {
    return of(null).pipe(
      switchMap(() => this.router.navigate(['social/networks/', networkId])),
      mapTo(null),
    );
  }
}

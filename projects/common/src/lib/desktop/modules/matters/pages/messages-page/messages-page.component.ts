import { Component, ChangeDetectionStrategy, ViewChild, ElementRef, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DestroyableBase } from '@jl/common/core';
import { Link } from '@jl/common/core/models';
import { Matter } from '@jl/common/core/models/matter';
import { MatterPost } from '@jl/common/core/models/matter-post';
import { MatterTopic } from '@jl/common/core/models/matter-topic';
import { MatterPostService } from '@jl/common/core/services/attorney/matter-post.service';
import { MatterTopicService } from '@jl/common/core/services/attorney/matter-topic.service';
import { MattersService } from '@jl/common/core/services/attorney/matters.service';
import { NotificationsService } from '@jl/common/core/services/notifications.service';
import { Observable, combineLatest, Subject } from 'rxjs';
import { map, take, switchMap, startWith, finalize, tap, shareReplay, takeUntil } from 'rxjs/operators';

import { MessageComponent } from './message/message.component';

interface RequiredData {
  /** Matter */
  matter: Matter;
  /** Matter topic */
  matterTopic: MatterTopic;
  /** Matter posts */
  matterPosts: MatterPost[];
}

/** Message details component */
@Component({
  selector: 'jlc-messages',
  templateUrl: './messages-page.component.html',
  styleUrls: ['./messages-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessagesPageComponent extends DestroyableBase implements AfterViewInit {
  private readonly updatePosts$ = new Subject<void>();
  private readonly requiredData$: Observable<RequiredData>;
  /** Matter as observable */
  public readonly matter$: Observable<Matter>;
  /** Matter topic as observable */
  public readonly matterTopic$: Observable<MatterTopic>;
  /** Matter posts as observable */
  public readonly matterPosts$: Observable<MatterPost[]>;

  /** Send form group */
  public sendForm = new FormGroup({
    message: new FormControl('', [Validators.required]),
  });

  /** Messages div element */
  @ViewChild('messagesContainer', { static: false })
  public messagesContainer: ElementRef<HTMLDivElement>;

  /** List of message components. */
  @ViewChildren(MessageComponent)
  public messages: QueryList<MessageComponent>;

  /** List of breadcrumb links. */
  public readonly breadcrumbs$: Observable<Link<string[]>[]>;

  /** Shows whether we should scroll chat container to the bottom. */
  private shouldScrollToBottom = true;

  /**
   * @constructor
   * @param activatedRoute
   * @param mattersService
   * @param matterTopicService
   * @param matterPostService
   * @param notificationService
   */
  public constructor(
    private activatedRoute: ActivatedRoute,
    private mattersService: MattersService,
    private matterTopicService: MatterTopicService,
    private matterPostService: MatterPostService,
    private notificationService: NotificationsService,
  ) {
    super();
    const topicId = this.activatedRoute.snapshot.params.id;

    this.requiredData$ = this.notificationService.unreadNotifications$.pipe(
      startWith(null),
      switchMap(() => this.getRequiredData(topicId)),
      shareReplay({
        refCount: true,
        bufferSize: 1,
      }),
    );

    this.matter$ = this.requiredData$.pipe(
      map(({ matter }) => matter),
    );

    this.matterTopic$ = this.requiredData$.pipe(
      map(({ matterTopic }) => matterTopic),
    );

    this.matterPosts$ = this.requiredData$.pipe(
      map(({ matterPosts }) => matterPosts),
      tap(() => {
        const element = this.messagesContainer.nativeElement;
        // Determine if an element has been totally scrolled
        if (element.scrollHeight - element.scrollTop === element.clientHeight) {
          // Then we should scroll to the bottom after message rendering.
          this.shouldScrollToBottom = true;
        }
      }),
      shareReplay({
        bufferSize: 1,
        refCount: true,
      }),
    );

    this.breadcrumbs$ = combineLatest([
      this.matter$,
      this.matterTopic$,
    ]).pipe(
      map(([matter, topic]) => [
        { label: 'Matters', link: ['/matters'] },
        { label: matter.title, link: ['/matters', matter.id.toString()] },
        { label: topic.title, link: ['/matters', 'messages', topic.id.toString()] },
      ]),
    );
  }

  /** @inheritdoc */
  public ngAfterViewInit(): void {
    // Scroll messages container to the bottom after messages rendering.
    this.messages.changes.pipe(
      takeUntil(this.destroy$),
    ).subscribe(() => {
      if (this.shouldScrollToBottom) {
        this.scrollToBottom();
      }
    });
  }

  /** On send */
  public onSend(matterTopicId: number): void {
    this.sendForm.markAllAsTouched();

    if (matterTopicId && this.sendForm.controls.message.enabled && this.sendForm.valid) {
      this.sendForm.controls.message.disable();

      this.matterPostService.createMatterPost(matterTopicId, this.sendForm.value.message)
        .pipe(
          take(1),
          finalize(() =>
            this.sendForm.controls.message.enable(),
          ),
        )
        .subscribe(() => {
          // Scroll to the bottom after message rendering.
          this.shouldScrollToBottom = true;
          this.updatePosts$.next();
          this.sendForm.controls.message.setValue('');

        });
    }
  }

  private getRequiredData(topicId: number): Observable<RequiredData> {
    const matterTopic$ = this.matterTopicService.getMatterTopicById(topicId).pipe(take(1));
    const matter$ = matterTopic$.pipe(
      switchMap(matterTopic => this.mattersService.getMatterById(matterTopic.matter).pipe(take(1))),
    );
    const matterPosts$ = this.updatePosts$.pipe(
      startWith(void 0),
      switchMap(() =>
        this.matterPostService.getMatterPosts(topicId)
          .pipe(take(1)),
      ),
    );

    return combineLatest([matter$, matterTopic$, matterPosts$])
      .pipe(
        map(([matter, matterTopic, matterPosts]) => ({ matter, matterTopic, matterPosts })),
      );
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      this.shouldScrollToBottom = false;
    }, 0);
  }

  /** Trackby function. */
  public trackMessage(_: number, message: MatterPost): MatterPost['id'] {
    return message.id;
  }
}

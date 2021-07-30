import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Matter } from '@jl/common/core/models';
import { MatterPost } from '@jl/common/core/models/matter-post';
import { MatterTopic } from '@jl/common/core/models/matter-topic';
import { MatterPostService } from '@jl/common/core/services/attorney/matter-post.service';
import { MatterTopicService } from '@jl/common/core/services/attorney/matter-topic.service';
import { MattersService } from '@jl/common/core/services/attorney/matters.service';
import { Observable, Subject, of } from 'rxjs';
import { startWith, switchMap, shareReplay, take, finalize, first } from 'rxjs/operators';

/**
 * Messages page for mobile workspace.
 */
@Component({
  selector: 'jlc-messages-page',
  templateUrl: './messages-page.component.html',
  styleUrls: ['./messages-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessagesPageComponent {
  /**
   * Matter as observable.
   */
  public readonly matter$: Observable<Matter>;
  /**
   * Matter topic as observable.
   */
  public readonly matterTopic$: Observable<MatterTopic>;
  /**
   * Matter posts as observable.
   */
  public readonly matterPosts$: Observable<MatterPost[]>;
  /**
   * Send form group.
   */
  public sendForm$ = this.initSendForm();

  private readonly updatePosts$ = new Subject<void>();

  /**
   * @constructor
   *
   * @param activatedRoute Activated route.
   * @param mattersService Matters service.
   * @param matterTopicService Matter topic service.
   * @param matterPostService Matter post service.
   */
  public constructor(
    private activatedRoute: ActivatedRoute,
    private mattersService: MattersService,
    private matterTopicService: MatterTopicService,
    private matterPostService: MatterPostService,
  ) {
    const topicId = this.activatedRoute.snapshot.params.id;

    this.matterTopic$ = this.initTopicStream(topicId);
    this.matterPosts$ = this.initPostsStream(topicId);
    this.matter$ = this.initMatterStream();
  }

  /** On send */
  public onSend(form: FormGroup): void {
    form.markAllAsTouched();

    if (!(form.controls.message.enabled && form.valid)) {
      return;
    }
    form.controls.message.disable();

    this.matterTopic$
      .pipe(
        take(1),
        switchMap((topic) => this.matterPostService.createMatterPost(topic.id, form.value.message)),
        finalize(() =>
          form.controls.message.enable(),
        ),
      )
      .subscribe(() => {
        this.updatePosts$.next();
        form.controls.message.setValue('');
      });
  }

  /**
   * TrackBy function for message list.
   * @param _ Index.
   * @param post Item.
   */
  public trackMessage(_: number, post: MatterPost): number {
    return post.id;
  }

  private initTopicStream(topicId: number): Observable<MatterTopic> {
    return this.matterTopicService.getMatterTopicById(topicId)
      .pipe(first());
  }

  private initMatterStream(): Observable<Matter> {
    return this.matterTopic$.pipe(
      first(),
      switchMap(matterTopic => this.mattersService.getMatterById(matterTopic.matter)),
    );
  }

  private initPostsStream(topicId: number): Observable<MatterPost[]> {
    return this.updatePosts$.pipe(
      startWith(void 0),
      switchMap(() =>
        this.matterPostService.getMatterPosts(topicId)
          .pipe(take(1)),
      ),
      shareReplay({
        bufferSize: 1,
        refCount: true,
      }),
    );
  }

  private initSendForm(): Observable<FormGroup> {
    return of(new FormGroup({
      message: new FormControl('', [Validators.required]),
    }));
  }
}

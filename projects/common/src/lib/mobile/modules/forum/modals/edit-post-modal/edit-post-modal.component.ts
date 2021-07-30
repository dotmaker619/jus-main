
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Topic, Post } from '@jl/common/core/models';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { PostService } from '@jl/common/core/services/post.service';
import { AlertService } from '@jl/common/mobile/services/alert.service';
import { BehaviorSubject, Observable, merge, NEVER, of, ReplaySubject } from 'rxjs';
import { first, withLatestFrom, switchMap, mapTo, switchMapTo, tap, startWith, filter, map } from 'rxjs/operators';

/** Edit post modal. */
@Component({
  selector: 'jlc-edit-post-modal',
  templateUrl: './edit-post-modal.component.html',
  styleUrls: ['./edit-post-modal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditPostModalComponent {
  /** Topic. */
  @Input()
  public set topic(topic: Topic) {
    this.topic$.next(topic);
  }

  /** Post to edit. */
  @Input()
  public set post(post: Post) {
    this.post$.next(post);
  }

  /** Is loading. */
  public isLoading$ = new BehaviorSubject<boolean>(false);

  /** Page title. */
  public title$: Observable<string>;

  /** Form. */
  public form$: Observable<FormGroup>;

  private topic$ = new ReplaySubject<Topic>();
  private post$ = new BehaviorSubject<Post>(null);

  /**
   * @constructor
   * @param postService Post service.
   * @param modalController Modal controller.
   * @param aleretService Alert service.
   * @param formBuilder Form builder.
   */
  public constructor(
    private readonly postService: PostService,
    private readonly modalController: ModalController,
    private readonly alertService: AlertService,
    private readonly formBuilder: FormBuilder,
  ) {
    this.form$ = this.initFormStream();
    this.title$ = this.initTitleStream();
  }

  /**
   * Handle form submit.
   * @param form Form.
   */
  public onSubmit(form: FormGroup): void {
    form.markAllAsTouched();
    if (form.invalid || this.isLoading$.value) {
      return;
    }
    this.isLoading$.next(true);
    this.topic$.pipe(
      first(),
      withLatestFrom(this.post$),
      switchMap(([topic, postToEdit]) => {
        const post = new Post({
          topicId: topic.id,
          text: form.value.message,
        });

        return postToEdit != null ? this.editPost(postToEdit.id, post) : this.createPost(post);
      }),
      onMessageOrFailed(() => this.isLoading$.next(false)),
      switchMap(() => this.alertService.showNotificationAlert({
        header: 'Posted',
      })),
    ).subscribe(() => this.close());
  }

  /** Handle click on cancel button. */
  public onCancelClick(): void {
    this.close();
  }

  private editPost(id: number, post: Post): Observable<void> {
    return this.postService.updatePostById(id, post).pipe(
      mapTo(null),
    );
  }

  private createPost(post: Post): Observable<void> {
    return this.postService.publishPost(post).pipe(
      mapTo(null),
    );
  }

  private initFormStream(): Observable<FormGroup> {
    const form = this.formBuilder.group({
      message: [null, [Validators.required]],
    });

    const fillForm$ = this.post$.pipe(
      filter(post => post != null),
      tap(post => form.controls.message.setValue(post.text)),
      switchMapTo(NEVER),
    );

    return merge(of(form), fillForm$);
  }

  private initTitleStream(): Observable<string> {
    return this.post$.pipe(
      map(post => post != null ? 'Edit Post' : 'Create Post'),
    );
  }

  private close(): void {
    this.modalController.dismiss();
  }
}

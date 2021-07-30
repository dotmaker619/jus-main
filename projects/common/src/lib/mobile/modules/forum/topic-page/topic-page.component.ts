import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, ActionSheetController } from '@ionic/angular';
import { Topic, Post } from '@jl/common/core/models';
import { Follow } from '@jl/common/core/models/follow';
import { Pagination } from '@jl/common/core/models/pagination';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { AuthService } from '@jl/common/core/services/auth.service';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { FollowService } from '@jl/common/core/services/follow.service';
import { PostService } from '@jl/common/core/services/post.service';
import { TopicsService } from '@jl/common/core/services/topics.service';
import { AlertService } from '@jl/common/mobile/services/alert.service';
import { Observable, BehaviorSubject, combineLatest, Subject, of, NEVER } from 'rxjs';
import { first, filter, map, switchMap, shareReplay, switchMapTo, mapTo, tap, startWith } from 'rxjs/operators';

import { EditPostModalComponent } from '../modals/edit-post-modal/edit-post-modal.component';

/** Topic page. */
@Component({
  selector: 'jlc-topic-page',
  templateUrl: './topic-page.component.html',
  styleUrls: ['./topic-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicPageComponent {
  /** Is loading. */
  public readonly isLoading$ = new BehaviorSubject<boolean>(false);

  /** Topic. */
  public readonly topic$: Observable<Topic>;

  /** Topic posts. */
  public readonly posts$: Observable<Post[]>;

  /** Pages count. */
  public readonly pagesCount$: Observable<number>;

  /** Current change. */
  public readonly pageChange$ = new BehaviorSubject<number>(0);

  /** Is topic followed. */
  public readonly isFollowed$: Observable<Follow>;

  private readonly update$ = new Subject<void>();

  /**
   * @constructor
   * @param topicsService Topics service.
   * @param postsService Posts service.
   * @param activatedRoute Actiated route.
   * @param alertService Alert service.
   * @param followService Follow service.
   * @param modalController Modal controller.
   * @param router Router.
   * @param actionSheetController Action sheet.
   * @param userService User service.
   */
  public constructor(
    private readonly topicsService: TopicsService,
    private readonly postsService: PostService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly alertService: AlertService,
    private readonly followService: FollowService,
    private readonly router: Router,
    private readonly modalController: ModalController,
    private readonly actionSheetController: ActionSheetController,
    private readonly userService: CurrentUserService,
  ) {
    this.topic$ = this.initTopicStream();
    this.isFollowed$ = this.initIsFollowedStream();
    const postsPagination$ = this.initPotstsPaginationStream(
      this.pageChange$,
      this.topic$,
    );
    this.posts$ = postsPagination$.pipe(map(p => p.items));
    this.pagesCount$ = postsPagination$.pipe(map(p => p.pagesCount));

    // Initially, open the last post or the page with selected post
    combineLatest([
      this.topic$,
      this.activatedRoute.params.pipe(map(({ postPosition }) => postPosition)),
    ]).pipe(
      first(),
      map(([topic, postPosition]) => postPosition || topic.postCount - 1),
      map(postPosition => Math.floor(postPosition / this.postsService.POSTS_PER_PAGE)),
    ).subscribe(
      (page) => this.pageChange$.next(page),
    );
  }

  /** Change current page. */
  public onPageChange(page: number): void {
    this.pageChange$.next(page);
  }

  /** Handle click on follow button. */
  public onFollowClick(): void {

    this.userService.currentUser$.pipe(
      first(),
      switchMap((user) =>
        user ? this.confirmFollow() : this.askForLogin()),
    ).subscribe();
  }

  private confirmFollow(): Observable<void> {
    const header = 'Following this topic';
    const message = 'You will receive notifications when a new reply to this topic is made.';
    return this.alertService.showConfirmation({
      header,
      message,
    }).pipe(
      filter(confirmed => confirmed),
      switchMapTo(this.followTopic()),
      first(),
      tap(() => this.update$.next()),
    );
  }

  private askForLogin(): Observable<void> {
    return this.alertService.showConfirmation({
      header: 'Login Required',
      message: 'Please login into your account',
    }).pipe(
      filter(confirmed => confirmed),
      tap(() => this.router.navigate(['auth', 'login'], {
        queryParams: {
          next: this.router.url,
        },
      })),
      mapTo(null),
    );
  }

  /**
   * Handle unfollow button click.
   * @param followId Follow id.
   */
  public onUnfollowClick(followId: number): void {
    this.alertService.showConfirmation({
      header: 'Unfollow this topic?',
      message: `Are you sure you want to stop following this topic?
      You will no longer receive a notification when a new reply to this post is made.`,
    }).pipe(
      filter(confirmed => confirmed),
      tap(() => this.isLoading$.next(true)),
      switchMapTo(this.followService.unfollowTopic(followId)),
      onMessageOrFailed(() => this.isLoading$.next(false)),
      first(),
    ).subscribe(() => this.update$.next());
  }

  private initIsFollowedStream(): Observable<Follow> {
    return this.topic$.pipe(
      switchMap(topic => this.topicsService.getFollowedTopics(0, topic.id)),
      switchMap(({ items }) => items ? of(items[0]) : NEVER),
    );
  }

  private followTopic(): Observable<void> {
    return this.topic$.pipe(
      first(),
      tap(() => this.isLoading$.next(true)),
      switchMap(topic => this.followService.followTopic(
        new Follow({
          topic,
        }),
      )),
      onMessageOrFailed(() => this.isLoading$.next(false)),
      mapTo(null),
    );
  }

  private initTopicStream(): Observable<Topic> {
    const topicId$ = this.activatedRoute.params.pipe(
      map(({ id }) => id),
      filter(id => id != null),
      first(),
    );
    return combineLatest([
      topicId$,
      this.update$.pipe(startWith(null)),
    ]).pipe(
      switchMap(([id]) => this.topicsService.getTopicById(id)),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }

  private initPotstsPaginationStream(
    pageChange$: Observable<number>,
    topic$: Observable<Topic>,
  ): Observable<Pagination<Post>> {
    return combineLatest([
      pageChange$,
      topic$,
    ]).pipe(
      switchMap(([page, topic]) =>
        this.postsService.getPosts(topic.id, page),
      ),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }

  /** Handle click on reply button. */
  public onReplyClick(): void {
    this.userService.currentUser$.pipe(
      first(),
      switchMap(user => user ? this.openReplyModal() : this.askForLogin()),
    ).subscribe();
  }

  private openReplyModal(): Observable<void> {
    return this.topic$.pipe(
      first(),
      switchMap(topic => this.modalController.create({
        component: EditPostModalComponent,
        componentProps: {
          topic,
        },
      })),
      switchMap(modal => modal.present() && modal.onDidDismiss()),
      tap(() => this.update$.next()),
      mapTo(null),
    );
  }

  /**
   * Handle click on post.
   * @param post Post.
   */
  public async onPostClick(post: Post): Promise<void> {
    const actionSheet = await this.actionSheetController.create({
      buttons: [
        {
          text: 'Edit Post',
          handler: () => this.editPost(post),
        },
        {
          text: 'Delete Post',
          role: 'destructive',
          handler: () => this.deletePost(post),
        },
        {
          text: 'Cancel',
          role: 'cancel',
        },
      ],
    });
    actionSheet.present();
  }

  private deletePost(post: Post): void {
    this.alertService.showConfirmation({
      buttonText: 'Delete',
      header: 'Are you sure you want to delete the post?',
      isDangerous: true,
    }).pipe(
      filter(shouldDelete => shouldDelete),
      tap(() => this.isLoading$.next(true)),
      switchMapTo(this.postsService.deletePostById(post.id)),
      onMessageOrFailed(() => this.isLoading$.next(false)),
      switchMap(() => this.alertService.showNotificationAlert({
        header: 'Post Deleted',
      })),
    ).subscribe(() => this.update$.next());
  }

  private editPost(post: Post): void {
    this.topic$.pipe(
      first(),
      switchMap(topic => this.modalController.create({
        component: EditPostModalComponent,
        componentProps: {
          topic,
          post,
        },
      })),
      switchMap(modal => modal.present() && modal.onDidDismiss()),
    ).subscribe(() => this.update$.next());
  }
}

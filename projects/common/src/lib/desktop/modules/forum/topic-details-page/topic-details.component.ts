import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Post, Topic, Link } from '@jl/common/core/models';
import { Follow } from '@jl/common/core/models/follow';
import { Role } from '@jl/common/core/models/role';
import { User } from '@jl/common/core/models/user';
import { AuthService } from '@jl/common/core/services/auth.service';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { FollowService } from '@jl/common/core/services/follow.service';
import { ForumService } from '@jl/common/core/services/forum.service';
import { PostService } from '@jl/common/core/services/post.service';
import { TopicsService } from '@jl/common/core/services/topics.service';
import { UrlsService } from '@jl/common/core/services/urls.service';
import { trackById } from '@jl/common/core/utils/trackby-id';
import { DialogsService } from '@jl/common/shared';
import {
  Observable,
  BehaviorSubject,
  of,
  combineLatest,
} from 'rxjs';
import {
  map,
  switchMap,
  shareReplay,
  take,
  switchMapTo,
} from 'rxjs/operators';

/** Topic details component. */
@Component({
  selector: 'jlc-topic-details',
  templateUrl: './topic-details.component.html',
  styleUrls: ['./topic-details.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicDetailsComponent implements OnInit {
  /** Page change subject. */
  public pageChange$ = new BehaviorSubject<number>(0);

  /** Page count. */
  public pagesCount$: Observable<number>;

  /** Topic update stream */
  private updateTopic$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  /** Category name. */
  public categoryName$: Observable<string>;

  /** Topics. */
  public posts$: Observable<Post[]>;
  /** Is topic followed by current user. */
  public isFollowed$: Observable<Follow>;

  /** Topic data from API */
  public topic$: Observable<Topic>;
  /** List of breadcrumb links. */
  public readonly breadcrumbs$: Observable<Link<string[]>[]>;

  /** Roles enum */
  public readonly roles = Role;

  /** Default icon for categories. */
  public readonly avatarFallbackUrl = '/assets/icons/profile_icon.svg';

  /** Current user */
  public currentUser$: Observable<User>;

  /** Trackby function. */
  public trackById = trackById;

  private topicId: number;

  /**
   * @constructor
   * @param postService
   * @param forumService
   * @param dialogService
   * @param route
   * @param topicService
   * @param router
   * @param followService
   * @param authService
   * @param userService
   * @param urlsService
   */
  public constructor(
    private forumService: ForumService,
    private postService: PostService,
    private topicService: TopicsService,
    private route: ActivatedRoute,
    private router: Router,
    private dialogService: DialogsService,
    private followService: FollowService,
    private authService: AuthService,
    private userService: CurrentUserService,
    public urlsService: UrlsService,
  ) {
    this.topicId = parseInt(this.route.snapshot.paramMap.get('topicId'), 10);
    this.topic$ = this.updateTopic$
      .pipe(switchMapTo(this.topicService.getTopicById(this.topicId)));

    const category$ = this.topic$
      .pipe(
        switchMap(topic => this.forumService.getCategoryById(topic.category)),
      );

    this.breadcrumbs$ = combineLatest([
      this.topic$,
      category$,
    ]).pipe(
      map(([topic, category]) => [
        { label: 'Jus-Law Forums', link: ['/forum'] },
        { label: category.title, link: ['/forum', 'category', category.id.toString()] },
        { label: topic.title, link: ['/forum', 'topic', topic.id.toString()] },
      ]),
    );
  }

  /** Change current page. */
  public onPageChange(page: number): void {
    this.pageChange$.next(page);
  }

  /**
   * Handle follow action.
   *
   * Preform is auth check, and tries to follow if use
   * */
  public onFollowClick(): void {
    this.dialogService.showConfirmationDialog({
      title: 'Following this topic',
      message: `You will receive notifications when a new reply to this topic is made.`,
    }).then((confirmed) => {
      if (!confirmed) {
        return;
      }

      const topicId = this.route.snapshot.params.topicId;
      const follow = new Follow({
        topic: new Topic({
          id: topicId,
        }),
      });
      this.authService.isAuthenticated$
        .pipe(
          take(1),
          switchMap(isAuthenticated => {
            if (isAuthenticated) {
              return this.followService.followTopic(follow)
                .pipe(
                  map(() => true),
                );
            }
            return of(false);
          }),
        ).subscribe(isAuthenticated => {
          if (isAuthenticated) {
            this.updateTopic$.next(true);
          } else {
            this.dialogService.showRedirectDialog();
          }
        });
    });
  }

  /**
   * Handle unfollow click.
   * @param followId - id of the followed object.
   */
  public onUnfollowClick(followId: number): void {
    this.dialogService.showConfirmationDialog({
      title: 'Unfollow this topic?',
      message: `Are you sure you want to stop following this topic?
      You will no longer receive a notification when a new reply to this post is made.`,
    }).then((confirmed) => {
      if (!confirmed) {
        return;
      }
      this.followService.unfollowTopic(followId)
        .pipe(
          take(1),
        )
        .subscribe(
          () => this.updateTopic$.next(true),
        );
    });
  }

  /** Check if user logged in and redirect to reply page */
  public onReplyClick(topicId: number): void {
    this.authService.isAuthenticated$
      .pipe(
        take(1),
      )
      .subscribe(isAuthenticated => {
        if (isAuthenticated) {
          this.router.navigate(['../reply'], { relativeTo: this.route });
        } else {
          this.dialogService.showRedirectDialog();
        }
      });
  }

  /**
   * Redirect to post edit page.
   * @param postId
   */
  public onEditPostClick(postId: number): void {
    this.router.navigate(['../edit', postId], { relativeTo: this.route });
  }

  /**
   * Delete post from forum.
   * @param postId
   */
  public onDeletePostClick(postId: number): void {
    this.dialogService.showConfirmationDialog({
      title: 'Delete post?',
      message: 'Are you sure you want delete this post?',
    }).then((confirmed) => {
      if (!confirmed) {
        return;
      }
      this.postService.deletePostById(postId)
        .pipe(
          take(1),
        ).subscribe(() => {
          this.pageChange$.next(this.pageChange$.getValue());
        });
    });
  }

  /** Subscribe to fetch topic data on update topic subject */
  public ngOnInit(): void {
    const initialPost = parseInt(this.route.snapshot.paramMap.get('postIndex'), 10);
    const initialPage = this.postService.getPageByPosition(initialPost);

    const pagination = this.pageChange$.pipe(
      switchMap(page => this.postService.getPosts(this.topicId, page)),
      shareReplay({ bufferSize: 1, refCount: true }),
    );

    this.posts$ = pagination.pipe(map(p => p.items));
    this.pagesCount$ = pagination.pipe(
      map(p => p.pagesCount),
    );
    this.currentUser$ = this.userService.currentUser$;
    combineLatest(
      this.posts$,
      this.pagesCount$,
    ).subscribe(([posts, pagesCount]) => {
      if (posts.length === 0) {
        this.pageChange$.next(pagesCount - 1);
      }
    });

    this.isFollowed$ = this.topic$
      .pipe(
        switchMap(topic => this.topicService.getFollowedTopics(0, topic.id)),
        map(page => page.items),
        map(follows => {
          if (follows) {
            return follows[0];
          }

          return null;
        }),
      );
    this.pageChange$.next(initialPage);

  }
}

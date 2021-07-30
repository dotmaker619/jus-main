import { Component, ChangeDetectionStrategy, Input, EventEmitter, Output } from '@angular/core';
import { PostActions, PostAction } from '@jl/common/core/models/post-actions';
import { PostData } from '@jl/common/core/models/post-data';
import { SocialPost } from '@jl/common/core/models/social-post';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { Observable } from 'rxjs';
import { startWith, filter, map } from 'rxjs/operators';

/**
 * Model to emit selected action
 */
export interface SelectedPostAction {
  /** Post id. */
  post: SocialPost;
  /** Action. */
  action: PostActions;
}

/**
 * Post list for the 'News' and 'Social' pages.
 */
@Component({
  selector: 'jlc-social-posts-list',
  templateUrl: './social-posts-list.component.html',
  styleUrls: ['./social-posts-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SocialPostsListComponent {
  /** Posts list. */
  @Input()
  public posts: SocialPost[];
  /** Post's id emmiter. */
  @Output()
  public readonly more = new EventEmitter<number>();
  /**
   * Post's action emmiter.
   */
  @Output()
  public readonly action = new EventEmitter<SelectedPostAction>();

  /** Current user id. */
  public readonly currentUserId$: Observable<number>;

  /**
   * Action list.
   */
  public readonly actionList: PostAction[] = [
    { id: PostActions.Edit, value: 'Edit Post' },
    { id: PostActions.Delete, value: 'Delete Post' },
  ];

  /**
   * @constructor
   *
   * @param userService User service.
   */
  public constructor(
    userService: CurrentUserService,
  ) {
    this.currentUserId$ = userService.currentUser$.pipe(
      filter((user) => user != null),
      map((user) => user.id),
      startWith(null),
    );
  }

  /**
   * Check if the current user is post author.
   *
   * @param id Author id.
   */
  public isCurrentUserAuthor(id: number): Observable<boolean> {
    return this.currentUserId$.pipe(
      map((val) => val === id),
    );
  }

  /**
   * TrackBy function for post list.
   *
   * @param _ Idx.
   * @param item Social post.
   */
  public trackPost(_: number, item: SocialPost): number {
    return item.id;
  }

  /**
   * Handle 'click' of actions button.
   * @param action Action
   * @param postId Post id.
   */
  public onActionClick(action: PostAction, post: SocialPost): void {
    this.action.emit({
      post: post,
      action: action.id,
    });
  }

  /**
   * Handle 'click' of 'Show more' button.
   */
  public onMoreClick(post: SocialPost): void {
    this.more.emit(post.id);
  }
}

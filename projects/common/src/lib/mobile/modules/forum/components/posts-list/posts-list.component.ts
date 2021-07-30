import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { Post } from '@jl/common/core/models';
import { trackById } from '@jl/common/core/utils/trackby-id';

/** Posts list component. */
@Component({
  selector: 'jlc-posts-list',
  templateUrl: './posts-list.component.html',
  styleUrls: ['./posts-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostsListComponent {
  /** Posts list. */
  @Input()
  public posts: Post[];

  /** On post click emitter. */
  @Output()
  public readonly postClick = new EventEmitter<Post>();

  /** Trackby function. */
  public trackById = trackById;

  /**
   * On post click.
   * @param post Post.
   */
  public onPostClick(post: Post): void {
    this.postClick.emit(post);
  }
}

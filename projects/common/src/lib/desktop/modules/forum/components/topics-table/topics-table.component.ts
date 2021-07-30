import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Topic } from '@jl/common/core/models';
import { PostService } from '@jl/common/core/services/post.service';
import { Observable } from 'rxjs';

/** Topics table component. */
@Component({
  selector: 'jlc-topics-table',
  templateUrl: './topics-table.component.html',
  styleUrls: ['./topics-table.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicsTableComponent {
  /** Topics. */
  @Input()
  public topics$: Observable<Topic[]>;

  /** Posts per page. */
  public readonly postsPerPage = this.postService.POSTS_PER_PAGE;

  /**
   * @constructor
   * @param postService
   */
  public constructor(private postService: PostService) { }
}

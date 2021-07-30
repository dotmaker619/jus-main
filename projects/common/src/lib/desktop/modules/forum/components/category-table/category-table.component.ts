import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Topic } from '@jl/common/core/models';
import { PostService } from '@jl/common/core/services/post.service';
import { Observable } from 'rxjs';

/** Topics table component. */
@Component({
  selector: 'jlc-category-table',
  templateUrl: './category-table.component.html',
  styleUrls: ['./category-table.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryTableComponent {
  /** Topics. */
  @Input() public categories$: Observable<Topic[]>;

  /** Posts per page. */
  public postsPerPage = this.postService.POSTS_PER_PAGE;

  /**
   * @constructor
   * @param postService
   */
  public constructor(private postService: PostService) {}
}

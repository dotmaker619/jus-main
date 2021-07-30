import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { PostData } from '@jl/common/core/models/post-data';

/** Post item for social or news list. */
@Component({
  selector: 'jlc-post-list-item',
  templateUrl: './post-list-item.component.html',
  styleUrls: ['./post-list-item.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostListItemComponent {
  /** Post. */
  @Input()
  public post: PostData;
}

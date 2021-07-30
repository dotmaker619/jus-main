import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { PostData } from '@jl/common/core/models/post-data';

/** Post details of social or news */
@Component({
  selector: 'jlc-post-details',
  templateUrl: './post-details.component.html',
  styleUrls: ['./post-details.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostDetailsComponent {
  /** Post. */
  @Input()
  public post: PostData;
}

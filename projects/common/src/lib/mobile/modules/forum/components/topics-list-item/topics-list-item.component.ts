import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Topic } from '@jl/common/core/models';

/** Item for topics list. */
@Component({
  selector: 'jlc-topics-list-item',
  templateUrl: './topics-list-item.component.html',
  styleUrls: ['./topics-list-item.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicsListItemComponent {
  /** Topic. */
  @Input()
  public topic: Topic;
}

import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Topic } from '@jl/common/core/models';
import { trackById } from '@jl/common/core/utils/trackby-id';

/** Topics list component. */
@Component({
  selector: 'jlc-topics-list',
  templateUrl: './topics-list.component.html',
  styleUrls: ['./topics-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicsListComponent {
  /** Topics. */
  @Input()
  public topics: Topic[];

  /** Trackby function. */
  public trackById = trackById;
}

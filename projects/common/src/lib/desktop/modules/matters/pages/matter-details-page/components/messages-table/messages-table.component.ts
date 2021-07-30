import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MatterTopic } from '@jl/common/core/models/matter-topic';

/** Messages table component. */
@Component({
  selector: 'jlc-messages-table',
  templateUrl: './messages-table.component.html',
  styleUrls: ['./messages-table.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessagesTableComponent  {
  /** Matter topics */
  @Input()
  public matterTopics: MatterTopic[];
}

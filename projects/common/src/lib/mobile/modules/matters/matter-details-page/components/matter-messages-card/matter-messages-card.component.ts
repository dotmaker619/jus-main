import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MatterTopic } from '@jl/common/core/models/matter-topic';
import { trackById } from '@jl/common/core/utils/trackby-id';

/** Matter messages card. Used in mobile workspace. */
@Component({
  selector: 'jlc-matter-messages-card',
  templateUrl: './matter-messages-card.component.html',
  styleUrls: ['./matter-messages-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatterMessagesCardComponent {
  /** Matter messages. */
  @Input()
  public messages: MatterTopic[];

  /** Trackby function. */
  public trackById = trackById;
}

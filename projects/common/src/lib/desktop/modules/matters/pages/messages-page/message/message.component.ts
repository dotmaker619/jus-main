import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MatterPost } from '@jl/common/core/models/matter-post';

/** Matter message. */
@Component({
  selector: 'jlc-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessageComponent {

  /** Matter post. */
  @Input()
  public matterPost: MatterPost;
}

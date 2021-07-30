import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { User } from '@jl/common/core/models/user';

/** Attorney list item. For mobile devices. */
@Component({
  selector: 'jlc-selectable-user-item',
  templateUrl: './selectable-user-item.component.html',
  styleUrls: ['./selectable-user-item.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectableUserItemComponent {
  /** Attorney. */
  @Input()
  public user: User;

  /** Is item selected. */
  @Input()
  public isSelected: boolean;
}

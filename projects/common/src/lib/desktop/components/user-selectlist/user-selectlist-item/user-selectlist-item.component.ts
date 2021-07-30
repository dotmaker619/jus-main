import { Component, ChangeDetectionStrategy, Input, EventEmitter, Output } from '@angular/core';
import { User } from '@jl/common/core/models/user';

/** List item for User selectlist component. */
@Component({
  selector: 'jlc-user-selectlist-item',
  templateUrl: './user-selectlist-item.component.html',
  styleUrls: ['./user-selectlist-item.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserSelectlistItemComponent {

  /** Is item selected. */
  @Input()
  public isSelected = false;

  /** User to display. */
  @Input()
  public user: User;

  /** Is item disabled. */
  @Input()
  public disabled = false;

  /** Toggle button emitter. */
  @Output()
  public readonly toggleButtonClicked = new EventEmitter<User>();

  /** Handle click on toggle button. */
  public onToggleClicked(): void {
    this.toggleButtonClicked.next(this.user);
  }
}

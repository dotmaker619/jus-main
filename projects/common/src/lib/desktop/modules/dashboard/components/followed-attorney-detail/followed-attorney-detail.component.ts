import {
  Component,
  ChangeDetectionStrategy,
  Input, EventEmitter, Output,
} from '@angular/core';
import { Attorney } from '@jl/common/core/models/attorney';

/**
 * Display info of followed attorney. Allow to unfollow attorney.
 */
@Component({
  selector: 'jlc-followed-attorney-detail',
  templateUrl: './followed-attorney-detail.component.html',
  styleUrls: ['./followed-attorney-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FollowedAttorneyDetailComponent {

  /**
   * Attorney data to display.
   */
  @Input() public attorney: Attorney;
  /**
   * Emit unfollow event from component.
   */
  @Output() public unfollowEmitter = new EventEmitter<void>();
  /**
   * Default icon for categories.
   */
  public readonly avatarFallbackUrl = '/assets/icons/profile_icon.svg';

  /**
   * Emit unfollow event data.
   */
  public onUnfollowClick(): void {
    this.unfollowEmitter.emit();
  }
}

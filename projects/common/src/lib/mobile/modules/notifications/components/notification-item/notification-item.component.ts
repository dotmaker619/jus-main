import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { ExtendedNotification } from '@jl/common/core/models/extended-notification';

/**
 * Notification item.
 */
@Component({
  selector: 'jlc-notification-item',
  templateUrl: './notification-item.component.html',
  styleUrls: ['./notification-item.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationItemComponent {
  /** Notification */
  @Input()
  public notification: ExtendedNotification;
}

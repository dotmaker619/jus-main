import { Component, ChangeDetectionStrategy } from '@angular/core';
import { BaseNotifications } from '@jl/common/shared/base-components/notifications/notifications.base';

/** Notifications page component. */
@Component({
  selector: 'jlc-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsComponent extends BaseNotifications {

}

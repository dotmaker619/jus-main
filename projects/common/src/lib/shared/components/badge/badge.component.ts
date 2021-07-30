import { Component, ChangeDetectionStrategy } from '@angular/core';

/** Base UI component. Badge with content. */
@Component({
  selector: 'jlc-badge',
  templateUrl: './badge.component.html',
  styleUrls: ['./badge.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeComponent {
}

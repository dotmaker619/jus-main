import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

/** Badge shows that attorney is verificated. */
@Component({
  selector: 'jlc-verificated-attorney-badge',
  templateUrl: './verificated-attorney-badge.component.html',
  styleUrls: ['./verificated-attorney-badge.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerificatedAttorneyBadgeComponent {
  /** Should display the text label. */
  @Input()
  public showLabel = true;
}

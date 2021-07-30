import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

/** Badge list component. */
@Component({
  selector: 'jlat-badge-list',
  templateUrl: './badge-list.component.html',
  styleUrls: ['./badge-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeListComponent {

  /** Badges. */
  @Input()
  public badges: string[];
}

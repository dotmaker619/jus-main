import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

/** Mobile dashboard card component. */
@Component({
  selector: 'jlat-dashboard-card-mini',
  templateUrl: './dashboard-card-mini.component.html',
  styleUrls: ['./dashboard-card-mini.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardCardMiniComponent {

  /**
   * Count.
   */
  @Input()
  public count: number;

  /**
   * Card title
   */
  @Input()
  public title: string;

  /**
   * Icon path.
   */
  @Input()
  public iconUrl: string;
}

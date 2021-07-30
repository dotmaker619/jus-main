import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

/**
 * Dashboard statistic card.
 */
@Component({
  selector: 'jlat-dashboard-card',
  templateUrl: './dashboard-card.component.html',
  styleUrls: ['./dashboard-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardCardComponent {

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
   * Navigation link.
   */
  @Input()
  public link: string;

  /**
   * Icon path.
   */
  @Input()
  public iconUrl: string;
}

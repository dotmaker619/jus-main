import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Topic } from '@jl/common/core/models';

/**
 * Opportunities list component.
 */
@Component({
  selector: 'jlat-dashboard-opportunities-list',
  templateUrl: './dashboard-opportunities-list.component.html',
  styleUrls: ['./dashboard-opportunities-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardOpportunitiesListComponent {

  /**
   * List title.
   */
  @Input()
  public title: string;

  /**
   * Opportunities.
   */
  @Input()
  public opportunities: Topic[] = [];

  /**
   * Track opportunity list by topic ID.
   *
   * @param topic Topic.
   */
  public trackByTopicId(_: number, topic: Topic): number {
    return topic.id;
  }

}

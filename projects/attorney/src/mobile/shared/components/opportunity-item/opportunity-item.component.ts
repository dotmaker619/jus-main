import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Topic } from '@jl/common/core/models';

/**
 * Opportunity list item.
 */
@Component({
  selector: 'jlat-opportunity-item',
  templateUrl: './opportunity-item.component.html',
  styleUrls: ['./opportunity-item.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpportunityItemComponent {
  /** Topic. */
  @Input()
  public topic: Topic;

  /** Should provide more detailed info. */
  @Input()
  public detail = false;
}

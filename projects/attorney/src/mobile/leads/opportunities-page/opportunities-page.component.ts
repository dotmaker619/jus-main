import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Topic } from '@jl/common/core/models';
import { TopicsService } from '@jl/common/core/services/topics.service';
import { Observable } from 'rxjs';

/**
 * Page with opportunities list.
 */
@Component({
  selector: 'jlat-opportunities-page',
  templateUrl: './opportunities-page.component.html',
  styleUrls: ['./opportunities-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpportunitiesPageComponent {

  /** Opportunities. */
  public topics$: Observable<Topic[]>;

  /**
   * @constructor
   *
   * @param topicsService Topics service.
   */
  public constructor(
    private readonly topicsService: TopicsService,
  ) {
    this.topics$ = this.topicsService.getOpportunities({
      ordering: '-created',
    }, false);
  }

  /**
   * Trackby func.
   */
  public trackByTopicId(_: number, topic: Topic): number {
    return topic.id;
  }
}

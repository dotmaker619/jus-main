import { Component, ChangeDetectionStrategy } from '@angular/core';
import { LeadsService } from '@jl/common/core/services/attorney/leads.service';
import { TopicsService } from '@jl/common/core/services/topics.service';
import { Observable } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

/**
 * Leads page.
 */
@Component({
  selector: 'jlat-leads-page',
  templateUrl: './leads-page.component.html',
  styleUrls: ['./leads-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeadsPageComponent {

  /**
   * Count of active leads.
   */
  public readonly activeLeadsCount$: Observable<number>;

  /**
   * Count of opportunities.
   */
  public readonly opportunitiesCount$: Observable<number>;

  /**
   * @constructor
   *
   * @param leadsService Leads service.
   * @param usersService
   */
  constructor(
    private readonly leadsService: LeadsService,
    private readonly topicsService: TopicsService,
  ) {
    this.activeLeadsCount$ = this.leadsService.leads$
      .pipe(
        map(leads => leads.length),
        distinctUntilChanged(),
      );

    this.opportunitiesCount$ = this.topicsService.getOpportunities()
      .pipe(
        map(topics => topics.length),
        distinctUntilChanged(),
      );
  }
}

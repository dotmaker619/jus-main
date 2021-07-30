import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CalendarQuarter, AttorneyStatistic } from '@jl/common/core/models';
import { StatisticsService } from '@jl/common/core/services/attorney/statistics.service';
import { DateTime } from 'luxon';
import { BehaviorSubject, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

/**
 * Dashboard statistics page component.
 */
@Component({
  selector: 'jlat-dashboard-statistics-page',
  templateUrl: './dashboard-statistics-page.component.html',
  styleUrls: ['./dashboard-statistics-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardStatisticsPageComponent {

  /**
   * Period statistic.
   */
  public readonly periodStatistic$: Observable<AttorneyStatistic>;

  /**
   * Calendar quarter.
   */
  public quarter$: BehaviorSubject<CalendarQuarter>;

  /**
   * @constructor
   */
  public constructor(
    private readonly statisticsService: StatisticsService,
  ) {
    this.quarter$ = new BehaviorSubject<CalendarQuarter>({
      start: DateTime.local().startOf('quarter').toISO({ includeOffset: false }),
      end: DateTime.local().endOf('quarter').toISO({ includeOffset: false }),
      quarterNumber: DateTime.local().quarter,
    });

    this.periodStatistic$ = this.quarter$
      .pipe(
        switchMap((dates: CalendarQuarter) => this.statisticsService.getPeriodStatistic(dates.start, dates.end)),
      );
  }

  /**
   * Change quarter.
   *
   * @param quarterDates Quarter start and and dates.
   */
  public onQuarterChange(quarterDates: CalendarQuarter): void {
    this.quarter$.next(quarterDates);
  }
}

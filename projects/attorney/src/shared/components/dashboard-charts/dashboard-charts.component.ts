import { Component, ChangeDetectionStrategy, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { AttorneyStatistic, CalendarQuarter } from '@jl/common/core/models';
import { DateTime } from 'luxon';

/**
 * Charts component.
 */
@Component({
  selector: 'jlat-dashboard-charts',
  templateUrl: './dashboard-charts.component.html',
  styleUrls: ['./dashboard-charts.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardChartsComponent implements OnInit {

  /**
   * Year.
   */
  public year: number;

  /**
   * Period statistic.
   */
  @Input()
  public periodStatistic: AttorneyStatistic;

  /**
   * Quarter dates.
   */
  @Input()
  public quarter: CalendarQuarter;

  /**
   * Quarter changes.
   */
  @Output()
  public quarterChange = new EventEmitter<CalendarQuarter>();

  /**
   * @inheritdoc
   */
  public ngOnInit(): void {
    this.year = DateTime.local().year;
  }

  /**
   * Emit next quarter click.
   */
  public onPrevClick(): void {
    const [startDate, endDate] = this.getQuarterDates();
    const reducedStartDate = startDate.minus({ quarter: 1 });
    const reducedEndDate = endDate.minus({ quarter: 1 });

    this.year = reducedStartDate.year;
    this.emitQuarterChanges(reducedStartDate, reducedEndDate);
  }

  /**
   * Emit next quarter click.
   */
  public onNextClick(): void {
    const [startDate, endDate] = this.getQuarterDates();
    const increasedStartDate = startDate.plus({ quarter: 1 });
    const increasedEndDate = endDate.plus({ quarter: 1 });

    this.year = increasedStartDate.year;
    this.emitQuarterChanges(increasedStartDate, increasedEndDate);
  }

  private getQuarterDates(): [DateTime, DateTime] {
    return [DateTime.fromISO(this.quarter.start), DateTime.fromISO(this.quarter.end)];
  }

  /**
   * Emmit quarter changes.
   *
   * @param startDate Start quarter date.
   * @param endDate End quarter date.
   */
  public emitQuarterChanges(startDate: DateTime, endDate: DateTime): void {
    const newQuarter = new CalendarQuarter({
      start: startDate.toISO({ includeOffset: false }),
      end: endDate.toISO({ includeOffset: false }),
      quarterNumber: startDate.quarter,
    });

    this.quarterChange.emit(newQuarter);
  }
}

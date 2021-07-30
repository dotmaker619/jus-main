import { Component, ChangeDetectionStrategy, Input, OnInit, ViewChild, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { CalendarQuarter } from '@jl/common/core/models';
import { Statistic } from '@jl/common/core/models/attorney-statistic';
import { Chart, ChartConfiguration, NestedTickOptions } from 'chart.js';
import { DateTime, Info } from 'luxon';

const GRAPH_COLOR = '#4e4b78';
const POINT_COLOR = '#fff';
const AXIS_COLOR = '#b3c1c8';

/**
 * Billable hours chart.
 */
@Component({
  selector: 'jlat-billable-hours',
  templateUrl: './billable-hours.component.html',
  styleUrls: ['./billable-hours.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillableHoursComponent implements OnInit, OnChanges {

  private chart: Chart;

  /**
   * Calendar quarter.
   */
  @Input()
  public quarter: CalendarQuarter;

  /**
   * Time billed.
   */
  @Input()
  public timeBilled: Statistic;

  /**
   * Chart ref element.
   */
  @ViewChild('chart', { static: true })
  public chartContainer: ElementRef;

  /**
   * @inheritdoc
   */
  public ngOnChanges(changes: SimpleChanges): void {
    if (this.chart) {
      const chartPoints = this.getChartPoints();
      const { suggestedMax, stepSize } = this.getXAxisTickOptions(chartPoints);

      this.chart.data.labels = this.getChartLabels();
      this.chart.data.datasets.forEach(dataset => dataset.data = chartPoints);
      this.chart.options.scales = {
        yAxes: [{
          ticks: {
            display: false,
            suggestedMin: 0,
            suggestedMax: suggestedMax,
            stepSize: stepSize,
          },
        }],
        ...this.chart.options.scales,
      };
      this.chart.update();
    }
  }

  /**
   * @inheritdoc
   */
  public ngOnInit(): void {
    this.chart = new Chart(this.chartContainer.nativeElement, this.getChartConfiguration());
  }

  private getChartConfiguration(): ChartConfiguration {
    const chartPoints = this.getChartPoints();
    const { suggestedMax, stepSize } = this.getXAxisTickOptions(chartPoints);

    return {
      type: 'line',
      data: {
        labels: this.getChartLabels(),
        datasets: [{
          data: chartPoints,
          backgroundColor: GRAPH_COLOR,
          borderColor: GRAPH_COLOR,
          pointBackgroundColor: POINT_COLOR,
          pointBorderColor: GRAPH_COLOR,
          pointBorderWidth: 2,
          lineTension: 0,
          fill: false,
        }],
      },
      options: {
        legend: {
          display: false,
        },
        scales: {
          yAxes: [{
            ticks: {
              display: false,
              suggestedMin: 0,
              suggestedMax,
              stepSize,
            },
            gridLines: {
              drawBorder: false,
              color: AXIS_COLOR,
              zeroLineColor: AXIS_COLOR,
              zeroLineWidth: 2,
              borderDash: [8],
            },
          }],
          xAxes: [{
            gridLines: {
              display: false,
            },
          }],
        },
      },
    };
  }

  private getChartLabels(): string[] {
    const startDate = DateTime.fromISO(this.quarter.start);
    const endDate = DateTime.fromISO(this.quarter.end);

    return Info.months('numeric')
      .filter(month => startDate.month <= +month && +month <= endDate.month)
      .map(monthNumber => Info.months('short')[+monthNumber - 1].toUpperCase());
  }

  private getChartPoints(): number[] {
    return this.timeBilled.stats.map(({ count }) => count);
  }

  private getXAxisTickOptions(chartPoints: number[]): Partial<NestedTickOptions> {
    const suggestedMax = Math.max(...chartPoints) + 1;
    const stepSize = Math.floor(chartPoints.reduce((acc, value) => acc + value) / chartPoints.length);

    return { suggestedMax, stepSize };
  }

}

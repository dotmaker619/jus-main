import { Component, ChangeDetectionStrategy, Input, OnInit, ElementRef, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { Statistic } from '@jl/common/core/models/attorney-statistic';
import { Chart, ChartConfiguration, ChartData, ChartDataSets } from 'chart.js';
import 'chartjs-plugin-labels';

interface ChartLabelArgs {
  /**
   * Label.
   */
  label: string;

  /**
   * Value.
   */
  value: number;

  /**
   * Value in percent.
   */
  percentage: number;

  /**
   * Index.
   */
  index: number;

  /**
   * Chart dataset.
   */
  dataset: ChartDataSets;
}

const OPPORTUNITY_SLICE_COLOR = '#5cb4a7';
const ACTIVE_LEADS_SLICE_COLOR = '#4892a6';
const ACTIVE_MATTERS_SLICE_COLOR = '#4e4b78';
const CONVERTED_STATISTIC_SLICE_COLOR = '#406e97';
const CHART_LABELS_COLOR = '#4a4a4a';

/**
 * Drawing the donut dashboard-charts
 */
@Component({
  selector: 'jlat-quarter-statistic',
  templateUrl: './quarter-statistic.component.html',
  styleUrls: ['./quarter-statistic.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuarterStatisticComponent implements OnInit, OnChanges {

  private chart: Chart;

  /**
   * Opportunities statistic.
   */
  @Input()
  public opportunitiesStatistic: Statistic;

  /**
   * Active leads statistic.
   */
  @Input()
  public activeLeadsStatistic: Statistic;

  /**
   * Active matters statistic.
   */
  @Input()
  public activeMattersStatistic: Statistic;

  /**
   * Converted leads statistic.
   */
  @Input()
  public convertedStatistic: Statistic;

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
      this.chart.data.datasets.forEach(dataset => dataset.data = [
        this.opportunitiesStatistic.totalSum,
        this.activeLeadsStatistic.totalSum,
        this.activeMattersStatistic.totalSum,
        this.convertedStatistic.totalSum,
      ]);
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
    return {
      type: 'doughnut',
      data: this.getChartData(),
      options: {
        cutoutPercentage: 60,
        legend: {
          display: false,
        },
        tooltips: {
          enabled: false,
        },
        plugins: {
          labels: {
            fontColor: CHART_LABELS_COLOR,
            fontSize: '12',
            fontStyle: 'bold',
            textMargin: 5,
            position: 'outside',
            render: (args: ChartLabelArgs): string => {
              return `${args.label}\n${args.percentage}%`;
            },
          },
        },
      },
    };
  }

  private getChartData(): ChartData {
    return {
      labels: ['Opportunities', 'Active Leads', 'Active Matters', 'Converted'],
      datasets: [{
        borderWidth: 0,
        backgroundColor: [
          OPPORTUNITY_SLICE_COLOR,
          ACTIVE_LEADS_SLICE_COLOR,
          ACTIVE_MATTERS_SLICE_COLOR,
          CONVERTED_STATISTIC_SLICE_COLOR,
        ],
        data: [
          this.opportunitiesStatistic.totalSum,
          this.activeLeadsStatistic.totalSum,
          this.activeMattersStatistic.totalSum,
          this.convertedStatistic.totalSum,
        ],
      }],
    };
  }

}

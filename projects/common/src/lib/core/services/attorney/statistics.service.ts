import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AttorneyStatisticDto } from '../../dto/attorney-period-statistic-dto';
import { AttorneyStatisticMapper } from '../../mappers/attorney-statistic.mapper';
import { AttorneyStatistic } from '../../models';
import { InvoiceStatistics } from '../../models/invoice-statistics';
import { InvoiceStatisticsFormat } from '../../models/invoice-statistics-format';
import { JusLawDateUtils } from '../../utils/date-utils';
import { AppConfigService } from '../app-config.service';

/**
 * Attorney statistic service.
 */
@Injectable({
  providedIn: 'root',
})
export class StatisticsService {
  private readonly statisticPeriodURL: string;
  private readonly invoiceStatisticsUrl: string;

  /**
   * @constructor
   *
   * @param appConfig App configuration service.
   * @param httpClient Http Client service
   * @param attorneyStatisticMapper Attorney statistic mapper.
   */
  public constructor(
    appConfig: AppConfigService,
    private readonly httpClient: HttpClient,
    private readonly attorneyStatisticMapper: AttorneyStatisticMapper,
  ) {
    this.statisticPeriodURL = new URL('users/attorneys/current/statistics/period/', appConfig.apiUrl).toString();
    this.invoiceStatisticsUrl = new URL('business/statistics/export/', appConfig.apiUrl).toString();
  }

  /**
   * Get statistic by period.
   *
   * @param start Quarter start date.
   * @param end Quarter end date.
   */
  public getPeriodStatistic(start: string, end: string): Observable<AttorneyStatistic> {
    const queryString = `?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}&time_frame=month`;
    const requestURL = `${this.statisticPeriodURL}${queryString}`;

    return this.httpClient.get<AttorneyStatisticDto>(requestURL)
      .pipe(
        map(dto => this.attorneyStatisticMapper.fromDto(dto)),
      );
  }

  /**
   * Export invoices statistics.
   *
   * @param from Start date.
   * @param to End date.
   * @param format File extension.
   */
  public exportInvoiceStatistics(from: Date, to: Date, format: InvoiceStatisticsFormat): Observable<InvoiceStatistics> {
    const params = new HttpParams()
      .set('period_start', JusLawDateUtils.formatDate(from))
      .set('period_end', JusLawDateUtils.formatDate(to))
      .set('extension', format);

    // Using Object type to avoid errors connected with responseType
    const httpOptions: Object = {
      params,
      responseType: 'blob',
    };
    return this.httpClient.get<Blob>(this.invoiceStatisticsUrl, httpOptions).pipe(
      map((blob) => new InvoiceStatistics({
        file: blob,
        name: this.generateInvoiceStatisticsName(from, to, format),
      })),
    );
  }

  private generateInvoiceStatisticsName(from: Date, to: Date, format: InvoiceStatisticsFormat): string {
    return `invoice_from-${JusLawDateUtils.formatDate(from)}_to-${JusLawDateUtils.formatDate(to)}.${format}`;
  }
}

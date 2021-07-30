import { Injectable } from '@angular/core';
import { IMapper } from '@jl/common/core/mappers/mapper';

import { AttorneyStatisticDto, StatsDto } from '../dto/attorney-period-statistic-dto';
import { AttorneyStatistic, Statistic, Stats } from '../models/attorney-statistic';

/**
 * Attorney statistic mapper.
 */
@Injectable({
  providedIn: 'root',
})
export class AttorneyStatisticMapper implements IMapper<AttorneyStatisticDto, AttorneyStatistic> {

  /**
   * @inheritdoc
   */
  public fromDto(data: AttorneyStatisticDto): AttorneyStatistic {
    if (data == null) {
      return null;
    }
    return new AttorneyStatistic({
      opportunities: new Statistic({
        totalSum: data.opportunities_stats.total_sum,
        stats: this.statsMapper(data.opportunities_stats.stats),
      }),
      activeLeads: new Statistic({
        totalSum: data.active_leads_stats.total_sum,
        stats: this.statsMapper(data.active_leads_stats.stats),
      }),
      activeMatters: new Statistic({
        totalSum: data.active_matters_stats.total_sum,
        stats: this.statsMapper(data.active_matters_stats.stats),
      }),
      converted: new Statistic({
        totalSum: data.converted_lead.total_sum,
        stats: this.statsMapper(data.converted_lead.stats),
      }),
      timeBilled: new Statistic({
        totalSum: this.toHours(data.time_billed.total_sum),
        stats: this.statsMapper(data.time_billed.stats),
      }),
    });
  }

  private statsMapper(statsDtos: StatsDto[]): Stats[] {
    return statsDtos.map(statsDto => new Stats({ date: statsDto.date, count: this.toHours(statsDto.count) }));
  }

  private toHours(minutes: number): number {
    return Math.ceil(minutes / 60);
  }

  /**
   * @inheritdoc
   */
  public toDto(data: AttorneyStatistic): AttorneyStatisticDto {
    throw new Error('Method not implemented.');
  }

}

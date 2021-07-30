/**
 * Stats DTO.
 */
export interface StatsDto {
  /**
   * Date.
   */
  date: Date;
  /**
   * Count.
   */
  count: number;
}

/**
 * Statistic DTO.
 */
export interface StatisticDto {
  /**
   * Total sum.
   */
  total_sum: number;
  /**
   * Stats.
   */
  stats: StatsDto[];
}

/**
 * Attorney statistic DTO.
 */
export interface AttorneyStatisticDto {
  /**
   * Opportunities statistic.
   */
  opportunities_stats: StatisticDto;

  /**
   * Active leads statistic.
   */
  active_leads_stats: StatisticDto;

  /**
   * Active matters statistic.
   */
  active_matters_stats: StatisticDto;

  /**
   * Active leads statistic.
   */
  converted_lead: StatisticDto;

  /**
   * Time billed statistic.
   */
  time_billed: StatisticDto;
}

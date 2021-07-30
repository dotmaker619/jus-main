/**
 * Stats.
 */
export class Stats {
  /**
   * Date.
   */
  public date: Date;
  /**
   * Count.
   */
  public count: number;

  /**
   * @constructor
   *
   * @param stats
   */
  public constructor(stats: Partial<Stats>) {
    this.date = stats.date;
    this.count = stats.count;
  }
}

/**
 * Statictic.
 */
export class Statistic {
  /**
   * Total sum.
   */
  public totalSum: number;
  /**
   * Stats.
   */
  public stats: Stats[];

  /**
   * @constructor
   *
   * @param statistic
   */
  public constructor(statistic: Partial<Statistic>) {
    this.totalSum = statistic.totalSum;
    this.stats = statistic.stats;
  }
}

/**
 * Attorney statistic.
 */
export class AttorneyStatistic {
  /**
   * Opportunities.
   */
  public opportunities: Statistic;

  /**
   * Active leads.
   */
  public activeLeads: Statistic;

  /**
   * Active matters.
   */
  public activeMatters: Statistic;

  /**
   * Converted leads.
   */
  public converted: Statistic;

  /**
   * Time billed.
   */
  public timeBilled: Statistic;

  /**
   * @constructor
   *
   * @param attorneyStatistic
   */
  public constructor(attorneyStatistic: Partial<AttorneyStatistic>) {
    this.opportunities = attorneyStatistic.opportunities;
    this.activeLeads = attorneyStatistic.activeLeads;
    this.activeMatters = attorneyStatistic.activeMatters;
    this.converted = attorneyStatistic.converted;
    this.timeBilled = attorneyStatistic.timeBilled;
  }
}

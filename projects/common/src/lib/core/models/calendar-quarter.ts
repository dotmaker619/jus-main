/**
 * Calendar quarter.
 */
export class CalendarQuarter {
  /**
   * Quarter start date.
   */
  public start: string;

  /**
   * Quarter end date.
   */
  public end: string;

  /**
   * Number of quarter.
   */
  public quarterNumber: number;

  /**
   * @constructor
   * @param quarter Calendar quarter.
   */
  constructor(quarter: Partial<CalendarQuarter>) {
    this.start = quarter.start;
    this.end = quarter.end;
    this.quarterNumber = quarter.quarterNumber;
  }
}

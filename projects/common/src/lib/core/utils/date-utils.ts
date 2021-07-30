import { Period } from '../models/period';

export namespace JusLawDateUtils {
  /**
   * Set time to 00:00:00.000 for certain datetime value.
   * @param value Datetime value to get start of day.
   */
  // tslint:disable-next-line: completed-docs
  export function getStartOfDay(value: Date): Date {
    const result = new Date(value);
    result.setHours(0);
    result.setMinutes(0);
    result.setSeconds(0);
    result.setMilliseconds(0);

    return result;
  }

  /**
   * Get end of day for certain date (set time to 23:59:59.999).
   * @param value Date value to get end of day.
   */
  // tslint:disable-next-line: completed-docs
  export function getEndOfDay(value: Date): Date {
    const result = new Date(value);
    result.setHours(23);
    result.setMinutes(59);
    result.setSeconds(59);
    result.setMilliseconds(999);

    return result;
  }

  /**
   * Make month period from a selected date.
   * @param date Date.
   */
  // tslint:disable-next-line: completed-docs
  export function makeMonthPeriod(date: Date): Period {
    return {
      from: new Date(date.getFullYear(), date.getMonth(), 1),
      to: new Date(date.getFullYear(), date.getMonth() + 1, 0),
    };
  }

  /**
   * Format date (yyyy-MM-dd).
   * Invoice API requires special date format.
   * @param date Date.
   */
  // tslint:disable-next-line: completed-docs
  export function formatDate(date: Date): string {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  }

  /**
   * Check if the days of two dates are different.
   * @param firstDate First date.
   * @param secondDate Second date.
   */
  // tslint:disable-next-line: completed-docs
  export function areDatesDifferent(firstDate: Date, secondDate: Date): boolean {
    return firstDate.getFullYear() !== secondDate.getFullYear() ||
      firstDate.getMonth() !== secondDate.getMonth() ||
      firstDate.getDate() !== secondDate.getDate();
  }

  /**
   * Sort dates.
   * @param a First date.
   * @param b Second date.
   */
  // tslint:disable-next-line: completed-docs
  export function sortDates(a: Date, b: Date): number {
    const aDate = (a && a.valueOf()) || 0;
    const bDate = (b && b.valueOf()) || 0;

    return bDate - aDate;
  }

  /**
   * Obtain month name from a specified date.
   * @param date Date to obtain month.
   */
  // tslint:disable-next-line: completed-docs
  export function obtainMonthName(date: Date | string): string {
    return new Date(date).toLocaleString('en-us', { month: 'long' });
  }
}

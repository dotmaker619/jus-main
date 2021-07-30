import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

/**
 * Custom date pipe extended from the built-in one.
 * Used for displaying the date with describing words like "Today" and "Yesterday".
 */
@Pipe({
  name: 'jusLawDate',
})
export class JusLawDatePipe extends DatePipe implements PipeTransform {
  /**
   * @inheritdoc
   * @param value string date
   */
  public transform(value: string | Date, format: string = 'MMM dd, yyyy', nullValue: string = '—'): string {
    if (value == null) {
      return nullValue;
    }

    const date = value instanceof Date ? value : new Date(value);
    if (this.isToday(date)) {
      return 'Today, ' + super.transform(value, 'h:mm a');
    } else if (this.isYesterday(date)) {
      return 'Yesterday, ' + super.transform(value, 'h:mm a');
    } else {
      return super.transform(value, `${format}, h:mm a`);
    }
  }

  private isToday(date: Date): boolean {
    const current = new Date(Date.now());
    return (
      current.getFullYear() === date.getFullYear() &&
      current.getMonth() === date.getMonth() &&
      current.getDate() === date.getDate()
    );
  }

  private isYesterday(date: Date): boolean {
    const current = new Date(Date.now());
    const daysInMonth = this.daysInMonth(date.getMonth(), date.getFullYear());

    const isYearCurrent = current.getFullYear() === date.getFullYear();
    const isMonthCurrent = current.getMonth() === date.getMonth();
    const isMonthPrevious = current.getMonth() === (date.getMonth() + 1) % 12;
    const isDayPrevious = current.getDate() === date.getDate() % daysInMonth;

    return (
      isYearCurrent && isDayPrevious && (isMonthCurrent || isMonthPrevious)
    );
  }

  private daysInMonth(month: number, year: number): number {
    return new Date(year, month, 0).getDate();
  }
}

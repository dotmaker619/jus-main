import { Pipe, PipeTransform } from '@angular/core';

/**
 * Get named time offset between now and provided date.
 */
@Pipe({
  name: 'jusLawNamedOffsetFromNow',
})
export class JusLawNamedOffsetFromNowPipe implements PipeTransform {
  /**
   * @inheritdoc
   */
  public transform(value: Date | number | null): any {
    if (value == null) {
      return '';
    }

    // Get distance in minutes
    const periodInMinutes = Math.floor((new Date().valueOf() - new Date(value).valueOf()) / 1000 / 60);
    const periodInHours = Math.floor(periodInMinutes / 60);
    const periodInDays = Math.floor(periodInHours / 24);

    if (periodInMinutes < 1) {
      return 'Now';
    }
    if (periodInHours === 0) {
      return `${periodInMinutes}m`;
    }
    if (periodInDays === 0) {
      return `${periodInHours}h`;
    }

    return `${periodInDays}d`;
  }
}

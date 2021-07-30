import { Pipe, PipeTransform } from '@angular/core';

/**
 * Formats minutes to time string.
 * e.g.:
 * 10 => 10m
 * 80 => 1h 20m
 * 670 => 11h 10m
 * etc.
 */
@Pipe({
  name: 'jusLawFormatMinutes',
})
export class JusLawFormatMinutesPipe implements PipeTransform {

  private readonly HOURS = 'hh';
  private readonly MINUTES = 'mm';

  /** @inheritdoc */
  public transform(value: number, format?: string): string {
    if (format && !(format.includes(this.HOURS) && format.includes(this.MINUTES))) {
      throw TypeError(`You didn\'t specify the format correctly. \
      Format must include "${this.HOURS}" for hours and "${this.MINUTES}" for minutes.`);
    }

    let hours = 0;
    let minutes = 0;

    if (value) {
      hours = Math.floor(value / 60);
      minutes = value - hours * 60;
    }

    if (format) {
      return format.replace(this.MINUTES, this.transformNumber(minutes))
        .replace(this.HOURS, this.transformNumber(hours));
    }

    return `${hours}h ${minutes}m`;
  }

  /** Adds to number an additional 0 if the number is only one symbol. */
  private transformNumber(number: number): string {
    if (number < 10) {
      return `0${number.toString()}`;
    }
    return number.toString();
  }

}

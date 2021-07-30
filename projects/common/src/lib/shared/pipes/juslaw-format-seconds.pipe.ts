import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe to format seconds into a human-readable time.
 * e.g.: 76 -> 01:16
 */
@Pipe({
  name: 'juslawFormatSeconds',
})
export class JuslawFormatSecondsPipe implements PipeTransform {

  /** @inheritdoc */
  public transform(secondsNum: number): string {
    const minutes = Math.floor(secondsNum / 60);
    const seconds = secondsNum % 60;

    return `${this.formatTimePart(minutes)}:${this.formatTimePart(seconds)}`;
  }

  /**
   * Format time part to readable string.
   * @param timePart Time part (seconds:minutes, seconds and minutes are time parts).
   */
  private formatTimePart(timePart: number): string {
    return Intl.NumberFormat([], {
      minimumIntegerDigits: 2,
    }).format(timePart);
  }
}

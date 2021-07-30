import { Pipe, PipeTransform } from '@angular/core';

/**
 * Formats name in short form.
 * e.g.:
 * Ivan Ivanov => Ivan I.
 */
@Pipe({
  name: 'jusLawShortName',
})
export class JusLawShortNamePipe implements PipeTransform {

  /** @inheritdoc */
  public transform(firstName: string, lastName?: string): string {
    if (!firstName && !lastName) {
      return 'Unknown';
    }

    return lastName
      ? `${firstName} ${lastName[0].toUpperCase()}.`
      : firstName;
  }

}

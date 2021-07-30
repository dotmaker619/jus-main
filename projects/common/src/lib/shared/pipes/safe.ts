import { Pipe, PipeTransform } from '@angular/core';
import {
  DomSanitizer,
  SafeHtml,
  SafeStyle,
  SafeScript,
  SafeUrl,
  SafeResourceUrl,
} from '@angular/platform-browser';

type SafeType = SafeHtml | SafeStyle | SafeScript | SafeUrl | SafeResourceUrl;

/**
 * Sanitize potentially dangerous code.
 */
@Pipe({ name: 'jusLawSafe' })
export class JusLawSafePipe implements PipeTransform {
  /**
   * @constructor
   *
   * @param sanitizer DOM Sanitizer.
   */
  constructor(private readonly sanitizer: DomSanitizer) { }

  /**
   * Make content safe
   *
   * @param value Value to sanitize.
   * @param type Type of content.
   */
  public transform(value: string, type: string): SafeType {
    switch (type) {
      case 'html':
        return this.sanitizer.bypassSecurityTrustHtml(value);
      case 'style':
        return this.sanitizer.bypassSecurityTrustStyle(value);
      case 'script':
        return this.sanitizer.bypassSecurityTrustScript(value);
      case 'url':
        return this.sanitizer.bypassSecurityTrustUrl(value);
      case 'resourceUrl':
        return this.sanitizer.bypassSecurityTrustResourceUrl(value);
      default:
        throw new Error(`Unable to bypass security for invalid type: ${type}`);
    }
  }
}

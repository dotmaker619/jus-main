import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { mapTo, tap } from 'rxjs/operators';

/**
 * External resources service.
 * @description Provides functionality to work with external resources - open external link e.g.
 */
@Injectable({
  providedIn: 'root',
})
export class ExternalResourcesService {
  /**
   * Open external link in current window.
   */
  public openExternalLink(url: string): Promise<void> {
    return of(true)
      .pipe(
        tap(() => window.open(url, '_self')),
        mapTo(null),
      )
      .toPromise();
  }
}

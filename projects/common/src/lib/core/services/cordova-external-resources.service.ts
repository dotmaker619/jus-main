import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { tap, mapTo } from 'rxjs/operators';

import { ExternalResourcesService } from './external-resources.service';

/**
 * External resources service.
 * @description Provides methods to navigate on external links.
 */
@Injectable({
  providedIn: 'root',
})
export class CordovaExternalResourcesService implements ExternalResourcesService {
  /**
   * Open external link in a system browser.
   */
  public openExternalLink(url: string): Promise<void> {
    return of(true)
      .pipe(
        tap(() => window.open(url, '_system')),
        mapTo(null),
      )
      .toPromise();
  }
}

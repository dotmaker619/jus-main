import { Router } from '@angular/router';
import { AttorneySearchInfo } from '@jl/common/core/models/attorney-search-info';
import { LocationService, PlaceResult } from '@jl/common/core/services/location.service';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

/**
 * Dashboard base class.
 *
 * @description Extended by Dashboard component for web-app.
 */
export class DashboardBase {

  /**
   * Provide current location to autocomplete search input.
   */
  public readonly place$: Observable<PlaceResult>;

  /**
   * @constructor
   *
   * @param router Angular router.
   * @param locationService Location service.
   */
  public constructor(
    private readonly router: Router,
    private readonly locationService: LocationService,
  ) {
    this.place$ = this.locationService.getPlaceCurrentPlace()
      .pipe(
        shareReplay({ bufferSize: 1, refCount: true }),
      );
  }

  /**
   * Redirect user to attorney search result component.
   *
   * @param searchData Attorney search info.
   */
  public onAttorneySearch(searchData: AttorneySearchInfo): void {
    this.router.navigate(['/attorney-search'], {
      queryParams: searchData,
    });
  }
}

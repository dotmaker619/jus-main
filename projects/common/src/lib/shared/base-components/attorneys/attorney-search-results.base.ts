import { MapTypeStyle } from '@agm/core';
import { ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Coordinates } from '@jl/common/core/models';
import { Attorney } from '@jl/common/core/models/attorney';
import { AttorneySearchInfo } from '@jl/common/core/models/attorney-search-info';
import { Specialty } from '@jl/common/core/models/specialty';
import { AppConfigService } from '@jl/common/core/services/app-config.service';
import { AttorneysService } from '@jl/common/core/services/attorneys.service';
import { PlaceResult, LocationService } from '@jl/common/core/services/location.service';
import { SpecialtyService } from '@jl/common/core/services/specialty.service';
import { Observable, Subject, of, merge } from 'rxjs';
import { filter, switchMap, debounceTime, shareReplay, withLatestFrom, startWith, distinctUntilChanged, map } from 'rxjs/operators';

/**
 * Default coordinates for map.
 */
const DEFAULT_MAPS_COORDINATES: Coordinates = {
  latitude: 40.730610,
  longitude: -73.935242,
};

/**
 * Attorney search results base class.
 */
export class BaseAttorneySearchResults {
  /**
   * Reference to container element with attorney cards.
   */
  @ViewChild('attorneyContainer', { static: false })
  public attorneyContainer: ElementRef;

  /**
   * Attorney search data.
   */
  public readonly searchData$: Observable<AttorneySearchInfo>;

  /**
   * List of found attorneys.
   */
  public readonly attorneys$: Observable<Attorney[]>;

  /**
   * Location data to center google map.
   */
  public readonly currentPlace$: Observable<PlaceResult>;

  /**
   * Location shown on the map.
   */
  public readonly mapLocation$: Observable<Coordinates>;

  /**
   * Search state name.
   */
  public readonly currentState$: Observable<string>;

  /**
   * Current speciality.
   */
  public readonly currentSpeciality$: Observable<Specialty>;

  /**
   * Currently selected attorney.
   */
  public readonly selectedAttorney$ = new Subject<Attorney>();

  /**
   * Google map styles.
   */
  public readonly mapStyles = this.appConfig.googleMapStyle as MapTypeStyle[];

  /**
   * @constructor
   * @param attorneysService Attorneys service.
   * @param specialtyService Specialty service.
   * @param locationService Location service.
   * @param appConfig App config service.
   * @param activatedRoute Angular activated route.
   * @param router Angular router.
   */
  public constructor(
    private readonly attorneysService: AttorneysService,
    private readonly specialtyService: SpecialtyService,
    private readonly locationService: LocationService,
    private readonly appConfig: AppConfigService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
  ) {
    this.searchData$ = this.initSearchDataStream();
    this.currentPlace$ = this.initCurrentPlaceStream(this.searchData$);
    this.currentState$ = this.initCurrentStateStream(this.searchData$);
    this.currentSpeciality$ = this.initCurrentSpecialtyStream(this.searchData$);
    this.mapLocation$ = this.initMapLocationStream(this.currentPlace$, this.selectedAttorney$);
    this.attorneys$ = this.initAttorneysStream(this.searchData$, this.currentState$);
  }

  private initCurrentSpecialtyStream(
    searchData$: Observable<AttorneySearchInfo>,
  ): Observable<Specialty> {
    return searchData$.pipe(
      filter(({ specialityId }) => specialityId != null),
      switchMap(({ specialityId }) => this.specialtyService.getSpecialtyById(specialityId)),
    );
  }

  private initSearchDataStream(): Observable<AttorneySearchInfo> {
    return this.activatedRoute.queryParams.pipe(
      map((params) => {
        return {
          longitude: params.longitude && parseFloat(params.longitude),
          latitude: params.latitude && parseFloat(params.latitude),
          specialityId: params.specialityId && parseInt(params.specialityId, 10),
          name: params.name,
        };
      }),
      debounceTime(400),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
  }

  private initAttorneysStream(
    searchData$: Observable<AttorneySearchInfo>,
    currentState$: Observable<string>,
  ): Observable<Attorney[]> {
    return currentState$.pipe(
      withLatestFrom(searchData$),
      switchMap(([state, searchData]) =>
        this.attorneysService.getNearestAttorneys({ ...searchData, state }).pipe(
          startWith(null), // To display loading on every search change
        ),
      ),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }

  private initCurrentPlaceStream(
    searchData$: Observable<AttorneySearchInfo>,
  ): Observable<google.maps.places.PlaceResult> {

    const placeChange$ = searchData$.pipe(
      distinctUntilChanged(isSamePlace),
      map(place => areCoordsPresented(place) ? place : null),
    );

    return placeChange$.pipe(
      filter((location) => location != null),
      switchMap((coords) => this.locationService.getPlaceByCoordinates(coords)),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }

  private initMapLocationStream(
    currentPlace$: Observable<google.maps.places.PlaceResult>,
    selectedAttorney$: Observable<Attorney>,
  ): Observable<Coordinates> {
    const curCoordinates$ = currentPlace$.pipe(
      map(place => ({
        latitude: place.geometry.location.lat(),
        longitude: place.geometry.location.lng(),
      } as Coordinates)),
    );

    return merge(
      curCoordinates$,
      selectedAttorney$.pipe(
        map(attorney => attorney.firmLocation),
      ),
    ).pipe(
      startWith(DEFAULT_MAPS_COORDINATES),
    );
  }

  private initCurrentStateStream(searchData$: Observable<AttorneySearchInfo>): Observable<string> {
    return searchData$.pipe(
      switchMap(data =>
        areCoordsPresented(data) ? this.locationService.getPlaceInfoFromCoordinates({
          longitude: data.longitude,
          latitude: data.latitude,
        }) : of(null)),
      map((place) => place && place.state),
    );
  }

  /**
   * Navigate map to selected attorney.
   *
   * @param attorney Attorney.
   */
  public onAttorneyClick(attorney: Attorney): void {
    this.selectedAttorney$.next(attorney);
    this.attorneyContainer
      .nativeElement
      .children
      .namedItem(`attorney-data-${attorney.id}`)
      .scrollIntoView();
  }

  /**
   * Update search results.
   *
   * @param searchData Attorney search info.
   */
  public onSearch(searchData: AttorneySearchInfo): void {
    this.router.navigate([], {
      queryParams: searchData,
      relativeTo: this.activatedRoute,
    });
  }

  /**
   * Track by attorney id.
   *
   * @param _ Index.
   * @param attorney Attorney.
   */
  public trackByAttorneyId(_: number, attorney: Attorney): number {
    return attorney.id;
  }

  /**
   * Extract specialty info.
   * @param attorney Attorney.
   */
  public extractSpecialtyInfo(attorney: Attorney): string {
    return attorney.specialties.map(specialty => specialty.title).join(', ');
  }
}

/**
 * Check if two places are equal.
 * @param x First place.
 * @param y Another place.
 */
function isSamePlace(x: Coordinates, y: Coordinates): boolean {
  return x.latitude === y.latitude && y.longitude === x.longitude;
}

/**
 * Check if coords presented in search data.
 * @param searchData Search data.
 */
function areCoordsPresented({ longitude, latitude }: Coordinates | AttorneySearchInfo): boolean {
  return longitude != null && latitude != null;
}

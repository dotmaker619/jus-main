import { MapsAPILoader } from '@agm/core';
import { Injectable, NgZone } from '@angular/core';
import { CoordinateMapper } from '@jl/common/core/mappers/coordinate.mapper';
import { PlaceInfoMapper } from '@jl/common/core/mappers/place-info.mapper';
import { PlaceInfo } from '@jl/common/core/models/place-info';
import { from, Observable } from 'rxjs';
import { map, switchMap, shareReplay } from 'rxjs/operators';

import { Coordinates } from '../models';

const GEOCODER_ERROR_MESSAGE = 'Geocoder caused an error, probably the limit is reached. \
Please, make sure you don\'t call geocoder too frequently.';

/**
 * @inheritdoc
 */
export type PlaceAutocomplete = google.maps.places.Autocomplete;

/**
 * @inheritdoc
 */
export type MapEventListener = google.maps.MapsEventListener;

/**
 * @inheritdoc
 */
export type PlaceResult = google.maps.places.PlaceResult;

/**
 * Location service.
 */
@Injectable({
  providedIn: 'root',
})
export class LocationService {

  private mapAPI$: Observable<void>;

  /**
   * Provide current location of the user if access was granted.
   */
  private currentLocation: Coordinates;

  /**
   * @constructor
   *
   * @param ngZone
   * @param mapsAPILoader Google maps API loader.
   * @param placeInfoMapper
   * @param coordinateMapper
   */
  constructor(
    private readonly ngZone: NgZone,
    private readonly mapsAPILoader: MapsAPILoader,
    private readonly placeInfoMapper: PlaceInfoMapper,
    private readonly coordinateMapper: CoordinateMapper,
  ) {
    this.mapAPI$ = from(this.ngZone.run(() => this.mapsAPILoader.load())).pipe(
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }

  /**
   * Get current coordinates.
   */
  private getCurrentCoordinates(): Observable<Coordinates> {
    return new Observable<Coordinates>(observer => {
      navigator.geolocation.getCurrentPosition((position) => {
        this.ngZone.run(() => {
          observer.next({
            longitude: position.coords.longitude,
            latitude: position.coords.latitude,
          });
          observer.complete();
        });
      });
    });
  }

  /**
   * Return place by current coordinates.
   */
  public getPlaceCurrentPlace(): Observable<PlaceResult> {
    return this.getCurrentCoordinates()
      .pipe(
        switchMap(coordinates => this.getPlaceByCoordinates(coordinates)),
      );
  }

  /**
   * Return place by coordinates.
   *
   * @param coordinates Coordinates
   */
  public getPlaceByCoordinates(coordinates: Coordinates): Observable<PlaceResult> {
    return this.mapAPI$.pipe(
      switchMap(() => {
        const geocoder = new google.maps.Geocoder();
        const location = new google.maps.LatLng(coordinates.latitude, coordinates.longitude);

        return new Observable<PlaceResult>(observer => {
          geocoder.geocode(
            { location },
            (result, status) => {
              this.ngZone.run(() => {
                if (status === 'OK') {
                  observer.next(result[0] as any);
                  observer.complete();
                } else {
                  observer.error(new Error(GEOCODER_ERROR_MESSAGE));
                }
              });
            });
        });
      }),
    );
  }

  /**
   * Provide place info from coordinates.
   * @param coordinates
   */
  public getPlaceInfoFromCoordinates(coordinates: Coordinates): Observable<PlaceInfo> {
    return this.mapAPI$.pipe(
      switchMap(() => {
        const geocoder = new google.maps.Geocoder();
        const location = new google.maps.LatLng(coordinates.latitude, coordinates.longitude);

        return new Observable<PlaceInfo>(observer => {
          geocoder.geocode(
            { location },
            (result, status) => {
              this.ngZone.run(() => {
                if (status === 'OK') {
                  observer.next(this.placeInfoMapper.fromDto(result[0]));
                  observer.complete();
                } else {
                  observer.error(new Error(status));
                }
              });
            });
        });
      }),
    );
  }

  /**
   * Map place result to coordinate value.
   * @param place
   */
  public getCoordinatesFromPlaceResult(place: PlaceResult): Coordinates {
    return this.coordinateMapper.fromDto(place);
  }

  /**
   * Get place autocomplete.
   *
   * @param elementRef Native element reference.
   * @param addressType Address type.
   */
  public initPlaceAutocomplete(elementRef: HTMLInputElement, addressType: string): Observable<PlaceAutocomplete> {
    return this.mapAPI$.pipe(
      map(() => new google.maps.places.Autocomplete(
        elementRef,
        {
          componentRestrictions: { country: 'US' },
          types: [addressType],
        }),
      ),
    );
  }

  /**
   * Return current user location possible.
   */
  public getCurrentLocation(): Observable<Coordinates> {
    return new Observable(observer => {
      if (this.currentLocation) {
        observer.next(this.currentLocation);
        observer.complete();
      }

      if (!navigator.geolocation) {
        this.ngZone.run(() => observer.error());
      }

      navigator.geolocation.getCurrentPosition(
        position => this.ngZone.run(() => {
          const positionCoordinates: Coordinates = {
            longitude: position.coords.longitude,
            latitude: position.coords.latitude,
          } as Coordinates;
          this.currentLocation = positionCoordinates;
          observer.next(positionCoordinates);
          observer.complete();
        }),
        () => this.ngZone.run(
          () => { observer.next(null); observer.complete(); }),
      );
    });
  }
}

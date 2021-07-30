import {GeocoderAddressComponent} from '@agm/core';
import {Injectable} from '@angular/core';
import {IMapper} from '@jl/common/core/mappers/mapper';
import {Coordinates} from '@jl/common/core/models';
import GeocoderResult = google.maps.GeocoderResult;
import {PlaceInfo} from '@jl/common/core/models/place-info';

const GOOGLE_TYPES_CITY = ['administrative_area_level_3', 'locality', 'neighbourhood'];
const GOOGLE_TYPES_STATE = ['administrative_area_level_1'];

/**
 * Map google's geocoder result to Place info
 */
@Injectable({
  providedIn: 'root',
})
export class PlaceInfoMapper implements IMapper<GeocoderResult, PlaceInfo> {
  /**
   * @inheritDoc
   * @param data
   */
  public fromDto(data: google.maps.GeocoderResult): PlaceInfo {
    if (data == null) {
      return null;
    }

    return new PlaceInfo({
      location: this.getLocation(data),
      state: this.getState(data),
      city: this.getCity(data),
      initial: data,
    });
  }

  /**
   * @inheritDoc
   * @param data
   */
  public toDto(data: PlaceInfo): google.maps.GeocoderResult {
    return undefined;
  }

    /**
   * Extract component long name from place result.
   * @param place
   * @param componentTypes
   */
  private getComponentName(place: GeocoderResult, componentTypes: string[]): string {
    // Filter components to leave only those with types within component types
    const components: GeocoderAddressComponent[] = place.address_components
      .filter(component => {
        // If filtered component types not empty, component has correct type to extract name.
        return componentTypes.filter(componentType => component.types.includes(componentType)).length > 0;
      });
    const componentNames: string[] = components.map(component => component.long_name);
    if (componentNames.length === 0) {
      return '';
    }
    return componentNames[0];
  }

  /**
   * Extract state name from place component
   * @param place
   */
  public getState(place: GeocoderResult): string {
    return this.getComponentName(place, GOOGLE_TYPES_STATE);
  }

  /**
   * Extract city name from place component.
   * @param place
   */
  public getCity(place: GeocoderResult): string {
    return this.getComponentName(place, GOOGLE_TYPES_CITY);
  }

  /**
   * Extract coordinates from geocoder results.
   * @param place
   */
  public getLocation(place: GeocoderResult): Coordinates {
    if (place == null || place.geometry == null) {
      return null;
    }

    return {
      latitude: place.geometry.location.lat(),
      longitude: place.geometry.location.lng(),
    };
  }

}

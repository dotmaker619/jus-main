import { TEntityValidationErrors } from '@jl/common/core/models/api-error';
import { Attorney } from '@jl/common/core/models/attorney';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

interface GoogleLocationAutocompleteData {
  /** Address components. */
  address_components: GoogleLocationAutocompleteData[];
  /** Address types. */
  types: string[];
  /** Address long name. */
  long_name: string;
  /** Address short name. */
  short_name: string;
}

/** Base eclass for attorney profile form. */
export class BaseAttorneyProfileForm {
  /**
   * Create Observable with extracted validation error for the `firmLocation` form control.
   */
  protected createFirmLocationValidationErrorStream(
    validationError$: Observable<TEntityValidationErrors<Attorney>>,
  ): Observable<string> {
    return validationError$
      .pipe(
        filter(validationErrors => validationErrors != null),
        map(validationErrors => {
          const {
            firmPlaceId,
            firmLocation,
            firmLocationCity,
            firmLocationState,
          } = validationErrors;
          // Return the error from any component with error.
          if (firmPlaceId != null) {
            return `Location: ${firmPlaceId}`;
          }
          if (firmLocation != null) {
            return `Location: ${firmLocation}`;
          }
          if (firmLocationCity != null) {
            return `Location city: ${firmLocationCity}`;
          }
          if (firmLocationState != null) {
            return `Location state: ${firmLocationState}`;
          }
          // No any error.
          return null;
        }),
      );
  }

  /**
   * Extract firm location city from google map autocomplete.
   * @param firmLocationData Firm location data from google map autocomplete.
   */
  protected extractFirmLocationCity(firmLocationData: GoogleLocationAutocompleteData): string {
    /**
     * Extract the city name from `locality` or if it is not presented then use `administrative_area_level_3`.
     * https://developers.google.com/places/supported_types#table3
     */
    return firmLocationData &&
      firmLocationData.address_components.reduce((city, address) => {
        if (address.types.includes('locality')) {
          city = address.long_name;
        }
        // Use administrative_area_level_3 only if locality is not presented.
        if (city === '' && address.types.includes('administrative_area_level_3')) {
          city = address.long_name;
        }
        return city;
      }, '');
  }

  /**
   * Extract firm location city from google map autocomplete.
   * @param firmLocationData Firm location data from google map autocomplete.
   */
  protected extractFirmLocationState(firmLocationData: GoogleLocationAutocompleteData): string {
    return firmLocationData &&
      firmLocationData.address_components.reduce((state, address) => {
        if (address.types.includes('administrative_area_level_1')) {
          state = address.long_name;
        }
        return state;
      }, '');
  }
}

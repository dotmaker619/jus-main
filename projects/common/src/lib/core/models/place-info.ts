import {Coordinates} from '@jl/common/core/models/coordinates';
import GeocoderResult = google.maps.GeocoderResult;

/**
 * Place info data.
 */
export class PlaceInfo {
  /**
   * Location
   */
  public location: Coordinates;
  /**
   * State name
   */
  public state: string;
  /**
   * City name
   */
  public city: string;
  /**
   * Initial google data.
   */
  public initial: GeocoderResult;

  /**
   * @inheritDoc
   */
  constructor(data: Partial<PlaceInfo>) {
    this.location = data.location;
    this.state = data.state;
    this.city = data.city;
    this.initial = data.initial;
  }
}

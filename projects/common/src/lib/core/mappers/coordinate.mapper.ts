import { Injectable } from '@angular/core';
import { IMapper } from '@jl/common/core/mappers/mapper';
import { Coordinates } from '@jl/common/core/models';
import { PlaceResult } from '@jl/common/core/services/location.service';

@Injectable({
  providedIn: 'root',
})
export class CoordinateMapper implements IMapper<PlaceResult, Coordinates> {
  /**
   * @inheritdoc
   *
   * @param data Place result.
   */
  public fromDto(data: PlaceResult): Coordinates {
    if (data == null || data.geometry == null) {
      return null;
    }

    const longitude = data.geometry.location.lng;
    const latitude = data.geometry.location.lat;

    return {
      longitude: typeof longitude === 'function' ? longitude() : longitude,
      latitude: typeof latitude === 'function' ? latitude() : latitude,
    };
  }

  /**
   * @inheritdoc
   *
   * @param data Coordinates.
   */
  public toDto(data: Coordinates): PlaceResult {
    throw new Error('Not implemented');
  }

}

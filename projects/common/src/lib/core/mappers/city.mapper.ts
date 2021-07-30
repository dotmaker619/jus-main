import { Injectable } from '@angular/core';
import {CityDto} from '@jl/common/core/dto/city-dto';
import {MapperWithErrors} from '@jl/common/core/mappers/mapper';
import {City} from '@jl/common/core/models/city';

import { ValidationErrorDto } from '../dto';
import { extractErrorMessage } from '../dto/validation-error-dto';
import { TEntityValidationErrors } from '../models/api-error';

/** City mapper */
@Injectable({
  providedIn: 'root',
})
export class CityMapper implements MapperWithErrors<CityDto, City> {

  constructor() { }

  /** @inheritDoc */
  public fromDto(city: CityDto): City {
    if (city == null || city === undefined) {
      return null;
    }
    return new City({
      id: city.id,
      name: city.name,
    });
  }

  /** @inheritDoc */
  public toDto(data: City): CityDto {
    if (data == null) {
      return null;
    }
    return {
      id: data.id,
      name: data.name,
    };
  }

  /**
   * @inheritdoc
   */
  public validationErrorFromDto(errorDto: ValidationErrorDto<CityDto> | null | undefined): TEntityValidationErrors<City> {
    if (errorDto == null) {
      return null;
    }
    return {
      id: extractErrorMessage(errorDto.id),
      name: extractErrorMessage(errorDto.name),
    };
  }
}

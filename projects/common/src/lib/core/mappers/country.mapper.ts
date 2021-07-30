import { Injectable } from '@angular/core';
import { CountryDto } from '@jl/common/core/dto/country-dto';
import { MapperFromDto } from '@jl/common/core/mappers/mapper';
import { Country } from '@jl/common/core/models/country';

/**
 * Country mapper.
 */
@Injectable({
  providedIn: 'root',
})
export class CountryMapper implements MapperFromDto<CountryDto, Country> {
  /** @inheritdoc */
  public fromDto(data: CountryDto): Country {
    if (data == null) {
      return null;
    }
    return new Country({
      id: data.id,
      name: data.name,
    });
  }
}

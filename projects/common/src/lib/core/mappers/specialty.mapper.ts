import { Injectable } from '@angular/core';
import { SpecialtyDto } from '@jl/common/core/dto/specialty-dto';
import { IMapper } from '@jl/common/core/mappers/mapper';
import { Specialty } from '@jl/common/core/models/specialty';

/** Specialty mapper */
@Injectable({
  providedIn: 'root',
})
export class SpecialtyMapper implements IMapper<SpecialtyDto, Specialty> {

  constructor() { }

  /** @inheritDoc */
  public fromDto(specialty: SpecialtyDto): Specialty {
    if (specialty === null || specialty === undefined) {
      return null;
    }
    return new Specialty({
      id: specialty.id,
      title: specialty.title,
    });
  }

  /**
   * Map Specialty model from array of DTO.
   * @param arr Array of Specialty DTO.
   */
  public fromArrayDto(arr: SpecialtyDto[]): Specialty[] | null {
    if (arr == null) {
      return [];
    }

    return arr.map(item =>
      new Specialty({
        id: item.id,
        title: item.title,
      }),
    );
  }

  /** @inheritDoc */
  public toDto(data: Specialty): SpecialtyDto {
    if (data == null) {
      return null;
    }

    return {
      id: data.id,
      title: data.title,
    };
  }

  /**
   * Map Specialty identifiers model from array of Specialties.
   * @param arr Array of Specialties.
   */
  public toArrayIds(arr: Specialty[]): number[] | null {
    if (arr == null || arr.length === 0) {
      return null;
    }

    return arr.map(item => item.id);
  }
}

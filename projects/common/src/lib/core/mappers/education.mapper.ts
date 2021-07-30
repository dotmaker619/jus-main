import { Injectable } from '@angular/core';
import {EducationDto} from '@jl/common/core/dto/education-dto';
import {MapperWithErrors} from '@jl/common/core/mappers/mapper';
import {Education} from '@jl/common/core/models/education';

import { ValidationErrorDto } from '../dto';
import { extractErrorMessage } from '../dto/validation-error-dto';
import { TEntityValidationErrors } from '../models/api-error';

/**
 * Education mapper
 */
@Injectable({
  providedIn: 'root',
})
export class EducationMapper implements MapperWithErrors<EducationDto, Education> {
  /**
   * @inheritDoc
   */
  public fromDto(data: EducationDto | null): Education | null {
    if (data == null) {
      return null;
    }
    return new Education({
      id: data.id,
      year: data.year,
      university: data.university,
    });
  }

  /**
   * Map Education model from array of DTO.
   * We need that because API returns education as an array with a single element.
   * @param data Education data.
   */
  public fromArrayDto(data: EducationDto[]): Education | null {
    if (data == null || data[0] == null) {
      return null;
    }

    const instance = data[0];
    return new Education({
      id: instance.id,
      year: instance.year,
      university: instance.university,
    });
  }

  /**
   * @inheritdoc
   */
  public toDto(data: Education | null): EducationDto | null {
    if (data == null) {
      return null;
    }

    if (data.id != null) {
      return {
        id: data.id,
        year: data.year,
        university: data.university,
      };
    }

    return {
      year: data.year,
      university: data.university,
    };
  }

  /**
   * Map Education to an array of DTO to satisfy API interface.
   * @param data Education data.
   */
  public toArrayDto(data: Education): EducationDto[] | null {
    if (data == null) {
      return null;
    }
    return [this.toDto(data)];
  }

  /**
   * @inheritdoc
   */
  public validationErrorFromDto(errorDto: ValidationErrorDto<EducationDto> | null | undefined): TEntityValidationErrors<Education> {
    if (errorDto == null) {
      return null;
    }
    return {
      id: extractErrorMessage(errorDto.id),
      university: extractErrorMessage(errorDto.university),
      year: extractErrorMessage(errorDto.year),
    };
  }
}

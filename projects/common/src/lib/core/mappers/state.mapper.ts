import { Injectable } from '@angular/core';
import { StateDto } from '@jl/common/core/dto/state-dto';
import { MapperWithErrors } from '@jl/common/core/mappers/mapper';
import { State } from '@jl/common/core/models/state';

import { ValidationErrorDto, extractErrorMessage } from '../dto/validation-error-dto';
import { TEntityValidationErrors } from '../models/api-error';

/** State mapper */
@Injectable({
  providedIn: 'root',
})
export class StateMapper implements MapperWithErrors<StateDto, State> {

  constructor() { }

  /** @inheritDoc */
  public fromDto(state: StateDto): State {
    if (state === null || state === undefined) {
      return null;
    }
    return new State({
      id: state.id,
      name: state.name,
    });
  }

  /**
   * Map State model from array of DTO.
   * @param arr Array of State DTO.
   */
  public fromArrayDto(arr: StateDto[]): State[] | null {
    if (arr == null) {
      return [];
    }

    return arr.map(item =>
      new State({
        id: item.id,
        name: item.name,
      }),
    );
  }

  /** @inheritDoc */
  public toDto(data: State): StateDto {
    if (data == null) {
      return null;
    }

    return {
      id: data.id,
      name: data.name,
    };
  }

  /**
   * Map States id from array of States.
   * @param arr Array of States.
   */
  public toArrayIds(arr: State[]): number[] | null {
    if (arr == null || arr.length === 0) {
      return null;
    }

    return arr.map(item => item.id);
  }

  /**
   * @inheritdoc
   */
  public validationErrorFromDto(errorDto: ValidationErrorDto<StateDto>): TEntityValidationErrors<State> {
    if (errorDto == null) {
      return null;
    }
    return {
      id: extractErrorMessage(errorDto.id),
      name: extractErrorMessage(errorDto.name),
    };
  }
}

import { Injectable } from '@angular/core';
import {FeeKindDto} from '@jl/common/core/dto/fee-kind-dto';
import {MapperWithErrors} from '@jl/common/core/mappers/mapper';
import {FeeKind} from '@jl/common/core/models/fee-kind';

import { ValidationErrorDto } from '../dto';
import { extractErrorMessage } from '../dto/validation-error-dto';
import { TEntityValidationErrors } from '../models/api-error';

/** Fee kind mapper */
@Injectable({
  providedIn: 'root',
})
export class FeeKindMapper implements MapperWithErrors<FeeKindDto, FeeKind> {
  /** @inheritDoc */
  public fromDto(feeKind: FeeKindDto): FeeKind {
    if (feeKind == null || feeKind === undefined) {
      return null;
    }
    return new FeeKind({
      id: feeKind.id,
      title: feeKind.title,
    });
  }

  /** @inheritDoc */
  public toDto(data: FeeKind): FeeKindDto {
    if (data == null) {
      return null;
    }

    return {
      id: data.id,
      title: data.title,
    };
  }

  /**
   * @inheritdoc
   */
  public validationErrorFromDto(errorDto: ValidationErrorDto<FeeKindDto> | null | undefined): TEntityValidationErrors<FeeKind> {
    if (errorDto == null) {
      return null;
    }
    return {
      id: extractErrorMessage(errorDto.id),
      title: extractErrorMessage(errorDto.title),
    };
  }
}

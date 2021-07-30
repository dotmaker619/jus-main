import { Injectable } from '@angular/core';

import { ValidationErrorDto } from '../dto';
import { ReferMatterDto } from '../dto/refer-matter-dto';
import { extractErrorMessage } from '../dto/validation-error-dto';
import { TEntityValidationErrors } from '../models/api-error';
import { ReferMatter } from '../models/refer-matter';

import { MapperWithErrors } from './mapper';

/**
 * Refer matter mapper.
 */
@Injectable({ providedIn: 'root' })
export class ReferMatterMapper implements MapperWithErrors<ReferMatterDto, ReferMatter> {
  /** @inheritdoc */
  public fromDto(dto: ReferMatterDto): ReferMatter {
    return new ReferMatter({
      emails: dto.emails,
      message: dto.message,
      title: dto.title,
      users: dto.users,
    });
  }

  /** @inheritdoc */
  public toDto(domain: ReferMatter): ReferMatterDto {
    return {
      emails: domain.emails,
      message: domain.message,
      title: domain.title,
      users: domain.users,
      user_type: domain.userType,
    };
  }

  /** @inheritdoc */
  public validationErrorFromDto(errorDto: ValidationErrorDto<ReferMatterDto> | null | undefined): TEntityValidationErrors<ReferMatter> {
    if (!errorDto) {
      return null;
    }
    return {
      emails: extractErrorMessage(errorDto.emails),
      message: extractErrorMessage(errorDto.message),
      title: extractErrorMessage(errorDto.title),
      users: extractErrorMessage(errorDto.users),
    };
  }
}

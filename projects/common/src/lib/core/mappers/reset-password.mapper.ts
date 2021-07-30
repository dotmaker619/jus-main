import { Injectable } from '@angular/core';
import { ResetPasswordDto } from '@jl/common/core/dto/reset-password-dto';
import { MapperToDtoWithErrors } from '@jl/common/core/mappers/mapper';
import { ResetPassword } from '@jl/common/core/models/reset-password';

import { ValidationErrorDto, extractErrorMessage } from '../dto/validation-error-dto';
import { TEntityValidationErrors } from '../models/api-error';

/** Mapper for reset password classes */
@Injectable({
  providedIn: 'root',
})
export class ResetPasswordMapper implements MapperToDtoWithErrors<ResetPasswordDto, ResetPassword> {

  /** @inheritdoc */
  public validationErrorFromDto(errorDto: ValidationErrorDto<ResetPasswordDto>): TEntityValidationErrors<ResetPassword> {
    return {
      email: extractErrorMessage(errorDto.email),
    };
  }

  /** Convert data to server format */
  public toDto(data: ResetPassword): ResetPasswordDto {
    return {
      email: data.email,
    };
  }

}

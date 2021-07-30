import {Injectable} from '@angular/core';
import {ValidationErrorDto} from '@jl/common/core/dto';
import {ResetPasswordConfirmationDto} from '@jl/common/core/dto/reset-password-confirmation-dto';
import {extractErrorMessage} from '@jl/common/core/dto/validation-error-dto';
import {MapperToDtoWithErrors} from '@jl/common/core/mappers/mapper';
import {TEntityValidationErrors} from '@jl/common/core/models/api-error';
import {ResetPasswordConfirmation} from '@jl/common/core/models/reset-password-confirmation';

/** Mapper for password reset confirmation */
@Injectable({
  providedIn: 'root',
})
export class ResetPasswordConfirmationMapper implements MapperToDtoWithErrors<ResetPasswordConfirmationDto, ResetPasswordConfirmation> {
  /** Convert password change data to server format */
  public toDto(data: ResetPasswordConfirmation): ResetPasswordConfirmationDto {
    const splitIndex =  data.resetPasswordToken.indexOf('-');
    const uid = data.resetPasswordToken.slice(0, splitIndex);
    const token = data.resetPasswordToken.slice(splitIndex + 1);
    return {
      new_password1: data.password1,
      new_password2: data.password2,
      uid,
      token,
    };
  }

  /** @inheritDoc */
  public validationErrorFromDto(
    errorDto: ValidationErrorDto<ResetPasswordConfirmationDto> | null | undefined,
  ): TEntityValidationErrors<ResetPasswordConfirmation> {
    if (errorDto == null) {
      return null;
    }

    return {
      password1: extractErrorMessage(errorDto.new_password1),
      password2: extractErrorMessage(errorDto.new_password2),
      resetPasswordToken: extractErrorMessage(errorDto.token),
    };
  }
}

import { ValidationErrorDto } from '../dto';
import { StaffRegistrationDto } from '../dto/staff-registration-dto';
import { extractErrorMessage } from '../dto/validation-error-dto';
import { TEntityValidationErrors } from '../models/api-error';
import { StaffRegistration } from '../models/staff-registration';

import { MapperToDtoWithErrors } from './mapper';

/** Staff registration data with preloaded avatar. */
type PreparedStaffRegistration = Omit<StaffRegistration, 'avatar'> & {
  /** Avatar url. */
  avatar: string;
};

/** Mapper for staff registration. */
export class StaffRegistrationMapper implements MapperToDtoWithErrors<StaffRegistrationDto, PreparedStaffRegistration> {
  /** @inheritdoc */
  public toDto(data: PreparedStaffRegistration): StaffRegistrationDto {
    return {
      avatar: data.avatar,
      verification_status: data.verificationStatus,
      description: data.description,
      email: data.email,
      first_name: data.firstName,
      last_name: data.lastName,
      password1: data.password,
      password2: data.passwordConfirmation,
    };
  }

  /** @inheritdoc */
  public validationErrorFromDto(errorDto: ValidationErrorDto<StaffRegistrationDto>): TEntityValidationErrors<PreparedStaffRegistration> {
    return {
      avatar: extractErrorMessage(errorDto.avatar),
      description: extractErrorMessage(errorDto.description),
      email: extractErrorMessage(errorDto.email),
      firstName: extractErrorMessage(errorDto.first_name),
      lastName: extractErrorMessage(errorDto.last_name),
      password: extractErrorMessage(errorDto.password1),
      passwordConfirmation: extractErrorMessage(errorDto.password2),
    };
  }

}

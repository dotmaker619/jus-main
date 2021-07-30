import { Injectable } from '@angular/core';

import { ValidationErrorDto } from '../dto';
import { StaffDto } from '../dto/staff-dto';
import { extractErrorMessage } from '../dto/validation-error-dto';
import { TEntityValidationErrors } from '../models/api-error';
import { Staff } from '../models/staff';

import { MapperWithErrors } from './mapper';

/** Mapper for staff user. */
@Injectable({ providedIn: 'root' })
export class StaffMapper implements MapperWithErrors<StaffDto, Staff> {
  /** @inheritdoc */
  public validationErrorFromDto(errorDto: ValidationErrorDto<StaffDto>): TEntityValidationErrors<Staff> {
    return {
      avatar: extractErrorMessage(errorDto.avatar),
      description: extractErrorMessage(errorDto.description),
      email: extractErrorMessage(errorDto.email),
      firstName: extractErrorMessage(errorDto.first_name),
      lastName: extractErrorMessage(errorDto.last_name),
      verificationStatus: extractErrorMessage(errorDto.verification_status),
    };
  }

  /** @inheritdoc */
  public fromDto(data: StaffDto): Staff {
    return new Staff(
      data.avatar,
      data.email,
      data.first_name,
      data.last_name,
      data.id,
      data.verification_status,
      data.description,
      data.is_paid,
    );
  }

  /** @inheritdoc */
  public toDto(data: Partial<Staff>): StaffDto {
    return {
      avatar: data.avatar,
      verification_status: data.verificationStatus,
      description: data.description,
      email: data.email,
      first_name: data.firstName,
      id: data.id,
      last_name: data.lastName,
    };
  }
}

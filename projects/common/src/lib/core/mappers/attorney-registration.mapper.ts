import { Injectable } from '@angular/core';
import { AttorneyRegistrationDto } from '@jl/common/core/dto/attorney-registration-dto';
import { AttorneyMapper } from '@jl/common/core/mappers/attorney.mapper';
import { MapperWithErrors } from '@jl/common/core/mappers/mapper';
import { AttorneyRegistration } from '@jl/common/core/models/attorney-registration';

import { ValidationErrorDto } from '../dto';
import { extractErrorMessage } from '../dto/validation-error-dto';
import { TEntityValidationErrors } from '../models/api-error';
import { Attorney } from '../models/attorney';

type AttorneyRegistrationGetters = Pick<AttorneyRegistration, 'fullName' | 'shortName' | 'description'>;

/**
 * Interface for prepared attorney registration object.
 *
 * @description It is required to make mapping more convenient using slightly changed variables,
 *  e.g `avatar` might only be a URL but not a file. So, using this model, you have to
 *  prepare (in this particular case preload) data so it may be mapped to DTO model.
 */
export type PreparedAttorneyRegistration = Omit<AttorneyRegistration, keyof AttorneyRegistrationGetters> & {
  /** Avatar URL. */
  avatar: string;
  /** URLs of attached files. */
  attachedFiles: string[];
};

/** Mapper for attorneys registration object */
@Injectable({ providedIn: 'root' })
export class AttorneyRegistrationMapper implements MapperWithErrors<AttorneyRegistrationDto, AttorneyRegistration> {
  private attorneyMapper = new AttorneyMapper();

  /** @inheritDoc */
  public fromDto(data: AttorneyRegistrationDto): AttorneyRegistration {
    return new AttorneyRegistration({
      password: data.password1,
      passwordRepeat: data.password2,
      ...this.attorneyMapper.fromDto(data),
    });
  }

  /** @inheritDoc */
  public toDto(data: PreparedAttorneyRegistration): AttorneyRegistrationDto {
    return {
      email: data.email,
      password1: data.password,
      password2: data.passwordRepeat,
      first_name: data.firstName,
      last_name: data.lastName,
      payment_method: data.paymentMethod,
      plan: data.paymentPlan,
      registration_attachments: data.attachedFiles,
      ...this.attorneyMapper.toDto(new Attorney({ ...data })),
    };
  }

  /**
   * @inheritdoc
   */
  public validationErrorFromDto(
    errorDto: ValidationErrorDto<AttorneyRegistrationDto> | null | undefined): TEntityValidationErrors<AttorneyRegistration> {
    if (errorDto == null) {
      return null;
    }
    return {
      password: extractErrorMessage(errorDto.password1),
      passwordRepeat: extractErrorMessage(errorDto.password2),
      ...this.attorneyMapper.validationErrorFromDto(errorDto),
    };
  }
}

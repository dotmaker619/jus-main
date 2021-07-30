import { Injectable } from '@angular/core';

import { ClientRegistrationDto } from '../dto/client-registration-dto';
import { ValidationErrorDto, extractErrorMessage } from '../dto/validation-error-dto';
import { TEntityValidationErrors } from '../models/api-error';
import { ClientRegistration } from '../models/client-registration';

import { ClientMapper } from './client.mapper';
import { MapperWithErrors } from './mapper';

/**
* Client registration mapper.
*/
@Injectable({
  providedIn: 'root',
})
export class ClientRegistrationMapper implements MapperWithErrors<ClientRegistrationDto, ClientRegistration> {
  private readonly clientMapper = new ClientMapper();

  /**
  * @inheritdoc
  */
  public fromDto(data: ClientRegistrationDto): ClientRegistration {
    if (data == null) {
      return null;
    }
    return new ClientRegistration({
      ...this.clientMapper.fromDto(data),
      password: data.password1,
      passwordConfirm: data.password2,
    });
  }

  /**
  * @inheritdoc
  */
  public toDto(data: ClientRegistration): ClientRegistrationDto {
    return {
      ...this.clientMapper.toDto(data),
      password1: data.password,
      password2: data.passwordConfirm,
      // TODO: (Danil) invite: null,
    };
  }

  /**
   * @inheritdoc
   */
  public validationErrorFromDto(errorDto: ValidationErrorDto<ClientRegistrationDto> | null | undefined)
    : TEntityValidationErrors<ClientRegistration> {
    if (errorDto == null) {
      return null;
    }
    return {
      ...this.clientMapper.validationErrorFromDto(errorDto),
      password: extractErrorMessage(errorDto.password1),
      passwordConfirm: extractErrorMessage(errorDto.password2),
    };
  }
}

import { Injectable } from '@angular/core';
import { ClientDto } from '@jl/common/core/dto/client-dto';
import { MapperWithErrors } from '@jl/common/core/mappers/mapper';
import { Client, ClientType } from '@jl/common/core/models/client';

import { ValidationErrorDto, extractErrorMessage } from '../dto/validation-error-dto';
import { TEntityValidationErrors } from '../models/api-error';

import { SpecialtyMapper } from './specialty.mapper';
import { StateMapper } from './state.mapper';

const CLIENT_TYPE_MAP_FROM_DTO: Record<ClientDto['client_type'], ClientType> = {
  'firm': ClientType.Organization,
  'individual': ClientType.Individual,
};

const CLIENT_TYPE_MAP_TO_DTO: Record<ClientType, ClientDto['client_type']> = {
  [ClientType.Organization]: 'firm',
  [ClientType.Individual]: 'individual',
};

/**
* Client mapper.
*/
@Injectable({
  providedIn: 'root',
})
export class ClientMapper implements MapperWithErrors<ClientDto, Client> {
  private readonly specialtyMapper = new SpecialtyMapper();
  private readonly stateMapper = new StateMapper();

  /**
  * @inheritdoc
  */
  public fromDto(data: ClientDto): Client {
    if (data == null) {
      return null;
    }
    return new Client({
      id: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      avatar: data.avatar,
      state: this.stateMapper.fromDto(data.state_data),
      helpDescription: data.help_description,
      specialties: data.specialities_data ? data.specialities_data.map(specialty => this.specialtyMapper.fromDto(specialty)) : [],
      clientType: this.mapClientTypeFromDto(data.client_type),
      organizationName: data.organization_name,
    });
  }

  /**
  * @inheritdoc
  */
  public toDto(data: Client): ClientDto {
    if (typeof data.avatar !== 'string' && data.avatar != null) {
      // API supports only URLs as avatar.
      throw new Error('Avatar should be an URL to an image');
    }

    return {
      avatar: data.avatar as string,
      id: data.id,
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      state: data.state && data.state.id,
      state_data: this.stateMapper.toDto(data.state),
      help_description: data.helpDescription,
      specialities: data.specialties.map(specialty => specialty.id),
      specialities_data: data.specialties.map(specialty => this.specialtyMapper.toDto(specialty)),
      client_type: this.mapClientTypeToDto(data.clientType),
      organization_name: data.organizationName,
    };
  }

  /**
   * @inheritdoc
   */
  public validationErrorFromDto(errorDto: ValidationErrorDto<ClientDto> | null | undefined): TEntityValidationErrors<Client> {
    if (errorDto == null) {
      return null;
    }
    return {
      avatar: extractErrorMessage(errorDto.avatar),
      email: extractErrorMessage(errorDto.email),
      firstName: extractErrorMessage(errorDto.first_name),
      lastName: extractErrorMessage(errorDto.last_name),
      helpDescription: extractErrorMessage(errorDto.help_description),
      id: extractErrorMessage(errorDto.id),
      state: extractErrorMessage(errorDto.state_data),
      specialties: extractErrorMessage(errorDto.specialities),
      clientType: extractErrorMessage(errorDto.client_type),
      organizationName: extractErrorMessage(errorDto.organization_name),
    };
  }

  /**
   * Map client type from dto.
   * @param clientTypeDto Client type dto.
   */
  public mapClientTypeFromDto(clientTypeDto: ClientDto['client_type']): ClientType {
    if (clientTypeDto == null) {
      return null;
    }
    return CLIENT_TYPE_MAP_FROM_DTO[clientTypeDto];
  }

  /**
   * Map client type to dto.
   * @param clientType Client type.
   */
  public mapClientTypeToDto(clientType: ClientType): ClientDto['client_type'] {
    return CLIENT_TYPE_MAP_TO_DTO[clientType];
  }
}

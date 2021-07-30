import { Injectable } from '@angular/core';
import { InviteDto } from '@jl/common/core/dto/invite-dto';
import { ClientMapper } from '@jl/common/core/mappers/client.mapper';
import { MapperWithErrors } from '@jl/common/core/mappers/mapper';
import { Invite } from '@jl/common/core/models/invite';

import { ValidationErrorDto } from '../dto';
import { extractErrorMessage } from '../dto/validation-error-dto';
import { TEntityValidationErrors } from '../models/api-error';

/** Invite mapper. */
@Injectable({ providedIn: 'root' })
export class InviteMapper implements MapperWithErrors<InviteDto, Invite> {
  private readonly clientMapper = new ClientMapper();

  /** @inheritdoc */
  public fromDto(invite: InviteDto): Invite {
    if (invite == null) {
      return null;
    }
    return new Invite({
      uuid: invite.uuid,
      client: this.clientMapper.fromDto(invite.client),
      firstName: invite.first_name,
      lastName: invite.last_name,
      email: invite.email,
      message: invite.message,
      sent: new Date(invite.sent),
      clientType: this.clientMapper.mapClientTypeFromDto(invite.client_type),
      organizationName: invite.organization_name,
    });
  }

  /** @inheritdoc */
  public toDto(invite: Invite): InviteDto {
    return {
      uuid: invite.uuid,
      client: invite.client != null ? this.clientMapper.toDto(invite.client) : null,
      first_name: invite.firstName,
      last_name: invite.lastName,
      email: invite.email,
      message: invite.message,
      client_type: this.clientMapper.mapClientTypeToDto(invite.clientType),
      organization_name: invite.organizationName,
    };
  }

  /** @inheritdoc */
  public validationErrorFromDto(errorDto: ValidationErrorDto<InviteDto> | null | undefined): TEntityValidationErrors<Invite> {
    if (!errorDto) {
      return null;
    }
    return {
      firstName: extractErrorMessage(errorDto.first_name),
      lastName: extractErrorMessage(errorDto.last_name),
      email: extractErrorMessage(errorDto.email),
      message: extractErrorMessage(errorDto.message),
      clientType: extractErrorMessage(errorDto.client_type),
      organizationName: extractErrorMessage(errorDto.organization_name),
    };
  }
}

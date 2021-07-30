import { Injectable } from '@angular/core';
import { ValidationErrorDto } from '@jl/common/core/dto';
import { MatterDto } from '@jl/common/core/dto/matter-dto';
import { extractErrorMessage } from '@jl/common/core/dto/validation-error-dto';
import { ClientMapper } from '@jl/common/core/mappers/client.mapper';
import { CountryMapper } from '@jl/common/core/mappers/country.mapper';
import { LeadMapper } from '@jl/common/core/mappers/lead.mapper';
import { MapperWithErrors } from '@jl/common/core/mappers/mapper';
import { TEntityValidationErrors } from '@jl/common/core/models/api-error';
import { Matter } from '@jl/common/core/models/matter';

import { ESignDocumentDto } from '../dto/esign-envelop-dto';
import { JusLawFile } from '../models/juslaw-file';
import { User } from '../models/user';

import { AttorneyMapper } from './attorney.mapper';
import { ESignEnvelopMapper } from './esign-envelop.mapper';

/** Matter mapper. */
@Injectable({ providedIn: 'root' })
export class MatterMapper implements MapperWithErrors<MatterDto, Matter> {
  private readonly leadMapper = new LeadMapper();
  private readonly clientMapper = new ClientMapper();
  private readonly attorneyMapper = new AttorneyMapper();
  private readonly countryMapper = new CountryMapper();
  private readonly eSignEnvelopMapper = new ESignEnvelopMapper();

  /** @inheritdoc */
  public fromDto(data: MatterDto): Matter {
    if (data == null) {
      return null;
    }
    const documents: JusLawFile[] = data.envelope_data == null
      ? []
      : data.envelope_data.documents
        .sort((a, b) => a.order - b.order)
        .map(docDto => {
          return new JusLawFile({
            name: docDto.name,
            file: docDto.file,
          });
        });
    return new Matter({
      documents,
      id: data.id,
      lead: this.leadMapper.fromDto(data.lead_data),
      client: this.clientMapper.fromDto(data.client_data),
      attorney: this.attorneyMapper.fromDto(data.attorney_data),
      code: data.code,
      title: data.title,
      description: data.description,
      rateType: data.rate_type,
      rate: data.rate,
      country: this.countryMapper.fromDto(data.country_data),
      state: data.state_data,
      city: data.city_data,
      status: data.status,
      stage: data.stage_data,
      chatChannel: data.chat_channel,
      created: new Date(data.created),
      modified: data.modified,
      timeBilled: data.time_billed,
      earned: data.fees_earned,
      completed: data.completed == null ? null : new Date(data.completed),
      eSignEnvelop: data.envelope_data == null
        ? null
        : this.eSignEnvelopMapper.fromDto(data.envelope_data),
      sharedWith: data.shared_with_data ? data.shared_with_data.map((val) => new User({
        avatar: val.avatar,
        email: val.email,
        firstName: val.first_name,
        id: val.id,
        lastName: val.last_name,
        role: val.user_type,
      })) : [],
      isSharedWithCurrentUser: data.is_shared,
    });
  }

  /** @inheritdoc */
  public toDto(data: Matter): MatterDto {
    if (data == null) {
      return null;
    }

    const esign_documents: ESignDocumentDto[] = data.documents && data.documents
      .map(doc => {
        if (typeof doc.file !== 'string') {
          throw new Error('Could not send not a URL of file. Upload certain files to S3 before save/create matter');
        }
        return {
          file: doc.file,
        };
      });

    return {
      esign_documents,
      id: data.id,
      lead: data.lead && data.lead.id,
      client: data.client && data.client.id,
      code: data.code,
      title: data.title,
      description: data.description,
      rate_type: data.rateType,
      rate: data.rate,
      country: data.country && data.country.id,
      state: data.state && data.state.id,
      city: data.city,
      status: data.status,
      stage: data.stage && data.stage.id,
      chat_channel: data.chatChannel,
      created: data.created == null ? null : data.created.toISOString(),
      modified: data.modified,
      time_billed: data.timeBilled,
      completed: data.completed == null ? null : data.completed.toISOString(),
    };
  }

  /** @inheritdoc */
  public validationErrorFromDto(errorDto: ValidationErrorDto<MatterDto> | null | undefined): TEntityValidationErrors<Matter> {
    if (!errorDto) {
      return null;
    }
    return {
      title: extractErrorMessage(errorDto.title),
      code: extractErrorMessage(errorDto.code),
      description: extractErrorMessage(errorDto.description),
      rate: extractErrorMessage(errorDto.rate),
      rateType: extractErrorMessage(errorDto.rate_type),
      documents: extractErrorMessage(errorDto.esign_documents),
    };
  }
}

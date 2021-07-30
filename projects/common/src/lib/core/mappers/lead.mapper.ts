import { Injectable } from '@angular/core';

import { AttorneyDto } from '../dto/attorney-dto';
import { ClientDto } from '../dto/client-dto';
import { LeadDto } from '../dto/lead-dto';
import { Attorney } from '../models/attorney';
import { Client } from '../models/client';
import { Lead } from '../models/lead';
import { LeadPriority } from '../models/lead-priority';

import { MapperFromDto } from './mapper';
import { StateMapper } from './state.mapper';
import { TopicMapper } from './topic.mapper';

/**
 * Lead mapper.
 */
@Injectable({providedIn: 'root'})
export class LeadMapper implements MapperFromDto<LeadDto, Lead> {
  private readonly topicMapper = new TopicMapper();
  private readonly stateMapper = new StateMapper();

  /** @inheritdoc */
  public fromDto(data: LeadDto): Lead {
    if (data == null) {
      return null;
    }
    return new Lead({
      id: data.id,
      attorney: this.mapLeadAttorneyFromDto(data.attorney_data),
      topic: this.topicMapper.fromDto(data.topic_data),
      client: this.mapLeadClientFromDto(data.client_data),
      lastMessage: data.last_message,
      priority: data.priority as LeadPriority,
      chatId: data.chat_channel,
      created: new Date(data.created),
    });
  }

  private mapLeadClientFromDto(clientDto: Partial<ClientDto>): Client {
    return new Client({
      avatar: clientDto.avatar,
      email: clientDto.email,
      firstName: clientDto.first_name,
      lastName: clientDto.last_name,
      id: clientDto.id,
      state: this.stateMapper.fromDto(clientDto.state_data),
    });
  }

  private mapLeadAttorneyFromDto(attorneyDto: Partial<AttorneyDto>): Attorney {
    return new Attorney({
      avatar: attorneyDto.avatar,
      email: attorneyDto.email,
      firstName: attorneyDto.first_name,
      lastName: attorneyDto.last_name,
      id: attorneyDto.id,
      isVerified: attorneyDto.is_verified,
    });
  }
}

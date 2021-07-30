import { Injectable } from '@angular/core';

import { NetworkDto } from '../dto/network-dto';
import { Network } from '../models/network';

import { AttorneyMapper } from './attorney.mapper';
import { IMapper } from './mapper';

/**
 * Group chat mapper.
 */
@Injectable({ providedIn: 'root' })
export class NetworkMapper implements IMapper<NetworkDto, Network> {

  /**
   * @constructor
   * @param attorneyMapper Attorney mapper.
   */
  public constructor(
    private readonly attorneyMapper: AttorneyMapper,
  ) { }

  /** @inheritdoc */
  public fromDto(data: NetworkDto): Network {
    return new Network({
      chatId: data.chat_channel,
      creator: this.attorneyMapper.fromDto(data.creator_data),
      id: data.id,
      participants: data.participants_data.map((p) => this.attorneyMapper.fromDto(p)),
      title: data.title,
    });
  }

  /** @inheritdoc */
  public toDto(data: Network): NetworkDto {
    return {
      id: data.id,
      participants: data.participants.map(p => p.id),
      title: data.title,
    };
  }

}

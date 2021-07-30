import { Injectable } from '@angular/core';

import { AuthorDto } from '../dto/author-dto';
import { CallInfoDto } from '../dto/call-info-dto';
import { CallInfo } from '../models/call-info';

import { AuthorMapper } from './author.mapper';
import { MapperFromDto } from './mapper';

interface CallInfoDtoExtended extends CallInfoDto {
  /**
   * Caller.
   * (!) not provided by API,
   *  should be provided extensively by the service.
   */
  caller: AuthorDto;
}

/** Call info mapper. */
@Injectable({
  providedIn: 'root',
})
export class CallInfoMapper implements MapperFromDto<CallInfoDtoExtended, CallInfo> {
  private readonly authorMapper = new AuthorMapper();
  /** @inheritdoc */
  public fromDto(data: CallInfoDtoExtended): CallInfo {
    return new CallInfo({
      callUrl: data.call_url,
      id: data.id,
      participants: data.participants_data.map(this.authorMapper.fromDto),
      caller: this.authorMapper.fromDto(data.caller),
    });
  }
}

import { Injectable } from '@angular/core';

import { MatterTopicDto } from '../dto/matter-topic-dto';
import { MatterTopic } from '../models/matter-topic';

import { MapperFromDto } from './mapper';
import { MatterPostMapper } from './matter-post.mapper';

/** Matter topic mapper. */
@Injectable({ providedIn: 'root' })
export class MatterTopicMapper implements MapperFromDto<MatterTopicDto, MatterTopic> {
  /** @constructor */
  public constructor(
    private matterPostMapper: MatterPostMapper,
  ) {}

  /** @inheritdoc */
  public fromDto(data: MatterTopicDto): MatterTopic {
    return new MatterTopic({
      id: data.id,
      title: data.title,
      matter: data.matter,
      lastPost: data.last_post && this.matterPostMapper.fromDto(data.last_post),
      postCount: data.post_count,
      created: new Date(data.created),
      modified: new Date(data.modified),
    });
  }
}

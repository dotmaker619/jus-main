import {Injectable} from '@angular/core';
import {FollowDto} from '@jl/common/core/dto/follow-dto';
import {IMapper} from '@jl/common/core/mappers/mapper';
import {TopicMapper} from '@jl/common/core/mappers/topic.mapper';
import {Follow} from '@jl/common/core/models/follow';

/** Mapper for Follow model */
@Injectable({
  providedIn: 'root',
})
export class FollowMapper implements IMapper<FollowDto, Follow> {

  public constructor (
    private topicMapper: TopicMapper,
  ) {}

  /** @inheritDoc */
  public fromDto(data: FollowDto): Follow {
    return new Follow({
      id: data.id,
      topic: this.topicMapper.fromDto(data.topic_data),
      unreadPostCount: data.unread_post_count,
      lastReadPost: data.last_read_post,
    });
  }

  /** @inheritDoc */
  public toDto(data: Follow): FollowDto {
    return {
      id: data.id,
      topic: data.topic.id,
      topic_data: null,
      unread_post_count: null,
      last_read_post: null,
    };
  }
}

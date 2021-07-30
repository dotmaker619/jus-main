import {TopicDto} from '@jl/common/core/dto/topic-dto';

/** Dto for follow model */
export interface FollowDto {
  /** Follow id */
  id: number;
  /** Followed topic */
  topic: number;
  /** Followed topic data */
  topic_data: TopicDto;
  /** Number of unread posts */
  unread_post_count: number;
  /** Last read post */
  last_read_post: number;
}

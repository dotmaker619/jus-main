import { PostDto } from './post-dto';

/** Topic dto model. */
export interface TopicDto {
  /** Id. */
  id: number;
  /** Category. */
  category: number;
  /** Title. */
  title: string;
  /** First post. */
  first_post: PostDto;
  /** Last post. */
  last_post: PostDto;
  /** Number of posts. */
  post_count: number;
  /** Is current user follows the topic */
  followed: number;
  /** Message text */
  message: string;
  /** Created date-time. */
  created?: string;
}

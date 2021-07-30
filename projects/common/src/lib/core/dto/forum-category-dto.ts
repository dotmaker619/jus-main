import { PostDto } from './post-dto';

/** Forum category dto model. */
export interface ForumCategoryDto {
  /** Forum category id. */
  id: number;

  /** Title. */
  title: string;

  /** Icon url. */
  icon: string;

  /** Description. */
  description: string;

  /** Number of topics in category. */
  topic_count: number;

  /** Number of posts in category. */
  post_count: number;

  /** Last post in category. */
  last_post: PostDto;

  /** Date of creation. */
  created: string;

  /** Date of modification. */
  modified: string;
}

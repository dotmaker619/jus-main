import { MatterPostDto } from './matter-post-dto';

/** Matter topic dto. */
export interface MatterTopicDto {
  /** Identifier */
  id: number;
  /** Title */
  title: string;
  /** Matter identifier */
  matter: number;
  /** Last matter post */
  last_post: MatterPostDto;
  /** Post count */
  post_count: string;
  /** Created at */
  created: string;
  /** Modified at */
  modified: string;
}

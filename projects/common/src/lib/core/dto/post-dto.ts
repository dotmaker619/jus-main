import { Role } from '@jl/common/core/models/role';

import { ForumPostAuthorDto } from './forum-post-author-dto';

/** Short information about topic. */
interface TopicInfo {
  /** Id. */
  id: number;
  /** Title. */
  title: string;
}

/** Post model. */
export class PostDto {
  /** Id. */
  public id: number;
  /** Short topic info. */
  public topic: number;
  /** Author. */
  public author: ForumPostAuthorDto;
  /** Text. */
  public text: string;
  /** Created. */
  public created: string;
  /** Modified. */
  public modified: string;
  /** User type */
  public user_type: Role;
  /** Post position in post */
  public position?: number;
}

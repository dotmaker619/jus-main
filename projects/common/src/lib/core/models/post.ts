
import { Role } from '@jl/common/core/models/role';

import { ForumPostAuthor } from './forum-post-author';

/** Post model. */
export class Post {
  /** Id. */
  public id: number;
  /** Topic id. */
  public topicId: number;
  /** Author. */
  public author: ForumPostAuthor;
  /** Text. */
  public text: string;
  /** Created. */
  public created: string;
  /** Modified. */
  public modified: string;
  /** User type */
  public userType: Role;
  /** Post position in topic */
  public position: number;

  /**
   * @constructor
   * @param post
   */
  public constructor(post: Partial<Post>) {
    this.id = post.id;
    this.topicId = post.topicId;
    this.author = post.author;
    this.text = post.text;
    this.created = post.created;
    this.modified = post.modified;
    this.userType = post.userType;
    this.position = post.position;
  }
}

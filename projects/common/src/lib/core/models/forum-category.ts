import { Post } from './post';

/** ForumCategory */
export class ForumCategory {
  /** Forum category id. */
  public id: number;

  /** Title. */
  public title: string;

  /** Icon url. */
  public icon: string;

  /** Description. */
  public description: string;

  /** Number of topics in category. */
  public topicCount: number;

  /** Number of posts in category. */
  public postCount: number;

  /** Last post in category. */
  public lastPost: Post;

  /** Date of creation. */
  public created: string;

  /** Date of modification. */
  public modified: string;

  /**
   * @constructor
   * @param category
   */
  public constructor(category: Partial<ForumCategory>) {
    this.id = category.id;
    this.title = category.title;
    this.icon = category.icon;
    this.description = category.description;
    this.topicCount = category.topicCount;
    this.postCount = category.postCount;
    this.lastPost = category.lastPost;
    this.created = category.created;
    this.modified = category.modified;
  }
}

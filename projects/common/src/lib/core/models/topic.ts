import { Post } from './post';

/** Topic dto model. */
export class Topic {
  /** Id. */
  public id: number;
  /** Category. */
  public category: number;
  /** Title. */
  public title: string;
  /** First post in topic. */
  public firstPost: Post;
  /** Last post in topic. */
  public lastPost: Post;
  /** Number of posts. */
  public postCount: number;
  /** Is user follow the topic */
  public followed: number;
  /** Message on topic creation */
  public message: string;
  /** Created date. */
  public created: Date;

  /**
   * @constructor
   * @param topic
   */
  public constructor(topic: Partial<Topic>) {
    this.id = topic.id;
    this.category = topic.category;
    this.title = topic.title;
    this.firstPost = topic.firstPost;
    this.lastPost = topic.lastPost;
    this.postCount = topic.postCount;
    this.followed = topic.followed;
    this.message = topic.message;
    this.created = topic.created;
  }
}

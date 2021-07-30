import { Author } from './author';

/** Matter post model. */
export class MatterPost {
  /** Identifier */
  public id: number;
  /** Topic identifier */
  public topic: number;
  /** Author as attorney or client */
  public author: Author;
  /** Text */
  public text: string;
  /** Created at */
  public created: Date;
  /** Modified at */
  public modified: Date;
  /** Is the post belongs to the current user. */
  public isMyPost: boolean;

  /** @constructor */
  constructor(matterPost: Partial<MatterPost>) {
    this.id = matterPost.id;
    this.topic = matterPost.topic;
    this.author = matterPost.author;
    this.text = matterPost.text;
    this.created = matterPost.created;
    this.modified = matterPost.modified;
    this.isMyPost = matterPost.isMyPost;
  }
}

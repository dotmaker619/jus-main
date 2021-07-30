import { MatterPost } from './matter-post';

/** Matter topic model. */
export class MatterTopic {
  /** Identifier */
  public id: number;
  /** Title */
  public title: string;
  /** Matter identifier */
  public matter: number;
  /** Last matter post */
  public lastPost: MatterPost;
  /** Post count */
  public postCount: string;
  /** Created at */
  public created: Date;
  /** Modified at */
  public modified: Date;

  /** @constructor */
  constructor(matterTopic: Partial<MatterTopic>) {
    this.id = matterTopic.id;
    this.title = matterTopic.title;
    this.matter = matterTopic.matter;
    this.lastPost = matterTopic.lastPost;
    this.postCount = matterTopic.postCount;
    this.created = matterTopic.created;
    this.modified = matterTopic.modified;
  }
}

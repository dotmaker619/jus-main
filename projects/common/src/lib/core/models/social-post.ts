import { SocialPostAuthor } from './social-post-author';

/**
 * Model of social post.
 */
export class SocialPost {
  /** ID. */
  public id: number;
  /** Author ID. */
  public author: number;
  /** Author information. */
  public authorData: SocialPostAuthor;
  /** Title. */
  public title: string;
  /** Image. */
  public image: string;
  /** Body. */
  public body: string;
  /** Preview. */
  public preview: string;
  /** Image thumbnail. */
  public imageThumbnail: string;
  /** Creation date. */
  public created: Date;
  /** Date of the last modification */
  public modified: Date;

  /**
   * @constructor
   *
   * @param data Initialize data.
   */
  public constructor(data: Partial<SocialPost>) {
    this.id = data.id;
    this.author = data.author;
    this.authorData = data.authorData;
    this.title = data.title;
    this.image = data.image;
    this.body = data.body;
    this.preview = data.preview;
    this.imageThumbnail = data.imageThumbnail;
    this.created = data.created;
    this.modified = data.modified;
  }
}

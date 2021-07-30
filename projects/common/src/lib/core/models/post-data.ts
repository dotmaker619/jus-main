interface PostAuthor {
  /** Author id. */
  id?: number;
  /** Name. */
  name: string;
  /** Avatar. */
  avatar?: string;
  /** Specialties. */
  specialties?: string[];
}

/**
 * Data to display in 'jlat-post-list-item' component.
 */
export class PostData {
  /** ID. */
  public id: number;
  /** Title. */
  public title: string;
  /** Creation date. */
  public created: Date;
  /** Content. It's used as [innerHtml] value. */
  public content: string;
  /** Image url. */
  public image: string;
  /** Author. */
  public author: PostAuthor;

  /**
   * @constructor
   *
   * @param data Initialize data.
   */
  public constructor(data: Partial<PostData>) {
    this.id = data.id;
    this.title = data.title;
    this.created = data.created;
    this.content = data.content;
    this.image = data.image;
    this.author = data.author;
  }

  /**
   * Get concatenated author specialties.
   */
  public get authorSpecialties(): string {
    return this.author.specialties
      ? this.author.specialties.join(', ')
      : '';
  }
}

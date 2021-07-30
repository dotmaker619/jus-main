/** News model. */
export class News {
  /** ID. */
  public id: number;
  /** Title. */
  public title: string;
  /** Description. */
  public description: string;
  /** Image. */
  public image: string;
  /** Image thumbnail. */
  public thumbnail: string;
  /** Tags. */
  public tags: string[];
  /** Categories. */
  public categories: string[];
  /** Created. */
  public created: Date;
  /** Modified. */
  public modified: Date;

  /**
   * @constructor
   *
   * @param data Initialize data.
   */
  public constructor(data: Partial<News>) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.image = data.image;
    this.thumbnail = data.thumbnail;
    this.tags = data.tags;
    this.categories = data.categories;
    this.created = data.created;
    this.modified = data.modified;
  }
}

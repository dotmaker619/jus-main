/** Stage model. */
export class Stage {
  /** Id */
  public id: number;
  /** Title */
  public title: string;

  /**
   * @constructor
   * @param stage
   */
  public constructor(stage: Partial<Stage>) {
    this.id = stage.id;
    this.title = stage.title;
  }
}

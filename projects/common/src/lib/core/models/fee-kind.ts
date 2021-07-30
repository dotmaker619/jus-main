/**
 * Fee kind.
 */
export class FeeKind {
  /**
   * ID.
   */
  public id: number;
  /**
   * Title.
   */
  public title: string;

  /**
   * @constructor
   * @param data Initialized data.
   */
  public constructor(data: Partial<FeeKind>) {
    this.id = data.id;
    this.title = data.title;
  }
}

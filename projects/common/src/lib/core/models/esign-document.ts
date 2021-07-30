/**
 * E-sign document.
 */
export class ESignDocument {
  /**
   * ID.
   */
  public id: number;

  /**
   * Document name.
   */
  public name: string;

  /**
   * Url to document file.
   */
  public fileUrl: string;

  /**
   * Order to display
   */
  public order: number;

  /**
   * @constructor
   * @param data Initialized data.
   */
  public constructor(data: Partial<ESignDocument>) {
    this.id = data.id;
    this.name = data.name;
    this.fileUrl = data.fileUrl;
    this.order = data.order;
  }
}

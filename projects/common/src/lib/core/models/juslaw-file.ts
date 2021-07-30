/**
 * Jus law file object.
 */
export class JusLawFile<FileType = (File | string)> {
  /**
   * Name of file.
   */
  public name: string;
  /**
   * File object or URL to a file.
   */
  public file: FileType;

  /**
   * Is document a local file.
   */
  public get isLocalFile(): boolean {
    return !(typeof this.file === 'string');
  }

  /**
   * @constructor
   * @param data Initialized data.
   */
  public constructor(data: Partial<JusLawFile<FileType>>) {
    this.name = data.name;
    this.file = data.file;
  }
}

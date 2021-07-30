/**
 * Model to work with files.
 *
 * @description
 * cordova-plugin-file works with the File API and override the 'File' contructor.
 * So it's impossible to create File instance of File API.
 * This class duplicates 'File' and includes some additional methods.
 *
 * @see https://github.com/apache/cordova-plugin-file/issues/265
 */
export class JlpFile extends Blob {
  /** File name */
  public name: string;

  /**
   * @constructor
   *
   * @param fileBits Blob parts to create Blob instance
   * @param fileName File name.
   * @param options Additional options.
   */
  public constructor(fileBits: BlobPart[], fileName: string, options?: FilePropertyBag) {
    super(fileBits, options);
    this.name = fileName;
  }

  /**
   * Create JlpFile instance from JlpFile or File instance.
   *
   * @param file JlpFile or File instance.
   */
  public static createFromFile(file: File): JlpFile {
    return new JlpFile(
      [file.slice()],
      file.name,
      { type: file.type },
    );
  }
}

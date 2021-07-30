import { JusLawFile } from './juslaw-file';
import { Matter } from './matter';

/** Voice consent for the matter. */
export class VoiceConsent<FileType = string | File> implements JusLawFile<FileType> {
  /** Voice consent id. */
  public readonly id: number;
  /** Matter consent belongs to. */
  public readonly matterData: Pick<Matter, 'id' | 'code' | 'title' | 'description'>;
  /** Audio file.. */
  public file: FileType;
  /** Consent title */
  public title: string;
  /** Voice consent title. */
  public get name(): string {
    return this.title;
  }
  /** @inheritdoc */
  public get isLocalFile(): boolean {
    return this.file instanceof File;
  }

  /**
   * @constructor
   * @param data Voice consent data.
   */
  public constructor(
    data: Partial<VoiceConsent<FileType>>,
  ) {
    this.id = data.id;
    this.matterData = data.matterData;
    this.file = data.file;
    this.title = data.title;
  }
}

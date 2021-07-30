import { Author } from './author';
import { JuslawDocumentType } from './document-type';
import { DocumentAction } from './juslaw-documents';
import { Matter } from './matter';

const FOLDER_TYPES: JuslawDocumentType[] = [
  JuslawDocumentType.Folder,
  JuslawDocumentType.SharedFolder,
  JuslawDocumentType.GlobalTemplateFolder,
  JuslawDocumentType.TemplateFolder,
];

/** Document model. */
export class JuslawDocument {
  /** Document id. */
  public readonly id: number;
  /** Parent node id. */
  public readonly parent: number;
  /** Owner. */
  public readonly owner: Author;
  /** Matter. */
  public readonly matter: Matter;
  /** Document title. */
  public readonly title: string;
  /** Document type. */
  public readonly type: JuslawDocumentType;
  /** File url. */
  public readonly file: string;
  /** Creator. */
  public readonly createdBy: Author;
  /** Date of creation. */
  public readonly created: Date;
  /** Date of last change. */
  public readonly modified: Date;
  /** Document icon url. */
  public readonly icon: string;
  /** Is document readonly. */
  public readonly isReadonly: boolean;
  /** Available actions for the document. */
  public readonly actions: DocumentAction[];
  /**
   * @constructor
   * @param data Document.
   */
  public constructor(data: Partial<JuslawDocument>) {
    this.id = data.id;
    this.parent = data.parent;
    this.owner = data.owner;
    this.matter = data.matter;
    this.title = data.title;
    this.type = data.type;
    this.file = data.file;
    this.createdBy = data.createdBy;
    this.created = data.created;
    this.modified = data.modified;
    this.icon = data.icon;
    this.actions = data.actions || [];
    this.isReadonly = data.isReadonly;
  }

  /**
   * Get file name without extension
   */
  public trimFileExtension(): string {
    return this.title.split('.').slice(0, -1).join('');
  }

  /**
   * Get file extension.
   */
  public getFileExtension(): string {
    return this.title.split('.').slice(-1)[0];
  }

  /** Is document a folder. */
  public get isFolder(): boolean {
    return FOLDER_TYPES.includes(this.type);
  }
}

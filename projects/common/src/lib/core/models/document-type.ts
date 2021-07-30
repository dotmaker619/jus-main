
/** Document type. */
export enum JuslawDocumentType {
  /** Folder. */
  Folder = 'Folder',
  /** Document. */
  Document = 'Document',
  /** Shared folder. */
  SharedFolder = 'SharedFolder',
  /** Template document. */
  TemplateDocument = 'TemplateDocument',
  /** Template folder. */
  GlobalTemplateFolder = 'TemplateFolder',
  /** Template folder created by user. */
  TemplateFolder = 'EditableTemplateFolder',
  /** Unsupported type of file. */
  Unsupported = 'Unsupported',
}

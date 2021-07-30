import { JuslawDocumentType } from './document-type';
import { Role } from './role';

/** Actions available for folders. */
export enum FolderAction {
  /** Rename document. */
  Rename = 'RenameFolder',
  /** Delete document. */
  Delete = 'DeleteFolder',
  /** Create a folder inside another. */
  CreateFolderInside = 'CreateFolder',
}

/** Available actions for files. */
export enum FileAction {
  /** Download document. */
  Download = 'DownloadFile',
  /** Copy document. */
  Copy = 'CopyFile',
  /** Delete document. */
  Delete = 'DeleteFile',
  /** Edit document. */
  Edit = 'EditFile',
}

/** Document action type. */
export type DocumentAction = FileAction | FolderAction;

type SpecifyActionFor<Type> =
  Type extends JuslawDocumentType.Document ? FileAction :
  Type extends JuslawDocumentType.TemplateDocument ? FileAction :
  FolderAction;

/** Available document permissions. */
enum DocumentPermissions {
  /** Default. */
  Default = 'Default',
  /** Readonly. */
  Readonly = 'Readonly',
}

type DocumentActionsByType = {
  [P in DocumentPermissions]: {
    [T in JuslawDocumentType]: SpecifyActionFor<T>[]
  }
};

type RolesWithDocumentPermissions = Exclude<Role, Role.Unauthorized>;

type DocumentActionsForRole = Record<RolesWithDocumentPermissions, DocumentActionsByType>;

const ATTORNEY_DOCUMENT_RULES: DocumentActionsByType = {
  Default: {
    Document: [
      FileAction.Download,
      FileAction.Copy,
      FileAction.Delete,
      FileAction.Edit,
    ],
    Folder: [
      FolderAction.CreateFolderInside,
      FolderAction.Rename,
      FolderAction.Delete,
    ],
    SharedFolder: [],
    EditableTemplateFolder: [
      FolderAction.CreateFolderInside,
      FolderAction.Rename,
      FolderAction.Delete,
    ],
    TemplateFolder: [
      FolderAction.CreateFolderInside,
    ],
    TemplateDocument: [
      FileAction.Download,
      FileAction.Edit,
    ],
    Unsupported: [],
  },
  Readonly: {
    Document: [
      FileAction.Download,
    ],
    Folder: [],
    SharedFolder: [],
    TemplateFolder: [],
    TemplateDocument: [
      FileAction.Download,
    ],
    EditableTemplateFolder: [],
    Unsupported: [],
  },
};

const DOCUMENT_RULES: DocumentActionsForRole = {
  [Role.Attorney]: {
    ...ATTORNEY_DOCUMENT_RULES,
  },
  [Role.Staff]: {
    ...ATTORNEY_DOCUMENT_RULES,
  },
  [Role.Client]: {
    Default: {
      Document: [
        FileAction.Download,
        FileAction.Delete,
      ],
      Folder: [],
      SharedFolder: [],
      TemplateFolder: [],
      TemplateDocument: [],
      Unsupported: [],
      EditableTemplateFolder: [],
    },
    Readonly: {
      Document: [
        FileAction.Download,
      ],
      Folder: [],
      SharedFolder: [],
      TemplateFolder: [],
      TemplateDocument: [],
      Unsupported: [],
      EditableTemplateFolder: [],
    },
  },
};

const READABLE_ACTION: Record<DocumentAction, string> = {
  [FileAction.Copy]: 'Copy',
  [FileAction.Edit]: 'Edit',
  [FileAction.Delete]: 'Delete',
  [FileAction.Download]: 'Download / View',
  [FolderAction.Delete]: 'Delete',
  [FolderAction.CreateFolderInside]: 'Create Folder',
  [FolderAction.Rename]: 'Rename',
};

/**
 * Namespace for working with documents,
 *  e.g. matter-documents, personal-documents or templates.
 */
export namespace JuslawDocuments {
  /**
   * Get available document actions for role and type of documents.
   * @param role User role.
   */
  // tslint:disable-next-line: completed-docs
  export function getDocumentActionsForRole(
    role: Role,
    docType: JuslawDocumentType,
    isReadonly: boolean = false,
  ): SpecifyActionFor<JuslawDocumentType>[] {
    const readonlyKey = isReadonly ?
      DocumentPermissions.Readonly : DocumentPermissions.Default;
    return DOCUMENT_RULES[role][readonlyKey][docType];
  }

  /**
   * Make document action readable.
   * @param action Any document action.
   */
  // tslint:disable-next-line: completed-docs
  export function actionToReadable(action: DocumentAction): string {
    return READABLE_ACTION[action];
  }
}

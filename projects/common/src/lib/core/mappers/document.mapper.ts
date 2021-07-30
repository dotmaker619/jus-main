import { Injectable } from '@angular/core';

import { ValidationErrorDto } from '../dto';
import { DocumentDto } from '../dto/document-dto';
import { extractErrorMessage } from '../dto/validation-error-dto';
import { TEntityValidationErrors } from '../models/api-error';
import { Author } from '../models/author';
import { JuslawDocumentType } from '../models/document-type';
import { JuslawDocument } from '../models/juslaw-document';
import { JuslawDocuments } from '../models/juslaw-documents';
import { Role } from '../models/role';

import { AuthorMapper } from './author.mapper';
import { IMapper } from './mapper';
import { MatterMapper } from './matter.mapper';

/** Document types that match with the backend description. */
const DEFAULT_DOCUMENT_TYPE_MAP: Record<DocumentDto['type'], JuslawDocumentType> = {
  Document: JuslawDocumentType.Document,
  Folder: JuslawDocumentType.Folder,
};

const DOCUMENT_TYPE_ICON_MAP: Record<JuslawDocumentType, string> = {
  [JuslawDocumentType.Document]: 'assets/icons/document_icon.svg',
  [JuslawDocumentType.SharedFolder]: 'assets/icons/people_icon.svg',
  [JuslawDocumentType.Folder]: 'assets/icons/folder_icon.svg',
  [JuslawDocumentType.TemplateDocument]: 'assets/icons/template_document.svg',
  [JuslawDocumentType.GlobalTemplateFolder]: 'assets/icons/template_folder.svg',
  [JuslawDocumentType.TemplateFolder]: 'assets/icons/folder_icon.svg',
  [JuslawDocumentType.Unsupported]: 'assets/icons/broken_file.svg',
};

@Injectable({
  providedIn: 'root',
})
export class DocumentMapper implements IMapper<DocumentDto, JuslawDocument> {

  private readonly matterMapper = new MatterMapper();
  private readonly authorMapper = new AuthorMapper();

  /** @inheritdoc */
  public fromDto(data: DocumentDto): JuslawDocument {
    const documentType = this.obtainDocumentTypeFromDto(data);
    const matter = data.matter_data && this.matterMapper.fromDto(data.matter_data);

    // Check whether the document should be readonly
    const isReadonly = data.is_global_template && data.parent == null;

    return new JuslawDocument({
      id: data.id,
      parent: data.parent,
      owner: this.obtainOwnerFromDocumentDto(data),
      matter,
      title: data.title,
      type: documentType,
      file: data.file,
      createdBy: data.created_by && this.authorMapper.fromDto(data.created_by_data),
      created: new Date(data.created),
      modified: new Date(data.modified),
      icon: DOCUMENT_TYPE_ICON_MAP[documentType] || 'assets/icons/document_icon.svg',
      actions: [],
      isReadonly,
    });
  }

  /**
   * Map document from dto with available actions for the role.
   * @param data Document dto.
   * @param role User role.
   * @param isReadonly Should the document be readonly. **The document may still be readonly no matter of the presented value.**
   */
  public fromDtoWithActions(
    data: DocumentDto,
    role: Role,
    isReadonly: boolean = false,
  ): JuslawDocument {
    const mappedDoc = this.fromDto(data);
    return new JuslawDocument({
      ...mappedDoc,
      actions: JuslawDocuments.getDocumentActionsForRole(
        role, mappedDoc.type, mappedDoc.isReadonly || isReadonly),
    });
  }

  /** @inheritdoc */
  public toDto(data: JuslawDocument): DocumentDto {
    return {
      parent: data.parent,
      title: data.title,
      matter: data.matter && data.matter.id,
      file: data.file,
    } as DocumentDto;
  }

  /** @inheritdoc */
  public validationErrorFromDto(errorDto: ValidationErrorDto<DocumentDto>): TEntityValidationErrors<JuslawDocument> {
    if (!errorDto) {
      return null;
    }
    return {
      title: extractErrorMessage(errorDto.title),
    };
  }

  /**
   * Map document type from dto to domain type.
   * @param dtoDoc Document.
   *
   * @description
   * The dto type is not quite descriptive, so
   *  in client-app typing logic slightly differs from the backend.
   * The backend only have two types - 'Folder' and 'Document', but practically,
   *  there might be way more types (and the their logic differs),
   *  e.g. 'Shared folder', which has different behavior (readonly + special icon).
   */
  private obtainDocumentTypeFromDto(dtoDoc: DocumentDto): JuslawDocumentType {
    /**
     * The model on backend is weird and has some kind of beacon properties like 'is_shared',
     *  we don't want it that way and it seems more logical to use 'type' property for this purpose.
     */
    if (dtoDoc.is_shared) {
      return JuslawDocumentType.SharedFolder;
    }

    // If it is a folder with readonly global templates
    if (dtoDoc.is_global_template && dtoDoc.type === 'Folder') {
      return JuslawDocumentType.GlobalTemplateFolder;
    }

    // If it is a parent folder with personal templates
    if (dtoDoc.is_template && dtoDoc.type === 'Folder' && dtoDoc.parent == null) {
      return JuslawDocumentType.GlobalTemplateFolder;
    }

    // If it is a child folder of personal templates
    if (dtoDoc.is_template && dtoDoc.type === 'Folder' && dtoDoc.parent != null) {
      return JuslawDocumentType.TemplateFolder;
    }

    // If it is a global template file
    if (dtoDoc.is_global_template && dtoDoc.type === 'Document') {
      return JuslawDocumentType.TemplateDocument;
    }

    // If it is a personal template file
    if (dtoDoc.is_template && dtoDoc.type === 'Document') {
      return JuslawDocumentType.Document;
    }

    const commonDocument = DEFAULT_DOCUMENT_TYPE_MAP[dtoDoc.type];

    if (commonDocument != null) {
      return commonDocument;
    }

    return JuslawDocumentType.Unsupported;
  }

  /**
   * Obtain document owner from dto object.
   * @param dtoDoc Document.
   */
  private obtainOwnerFromDocumentDto(dtoDoc: DocumentDto): Author | null {
    const isTemplate = dtoDoc.is_global_template || dtoDoc.is_template;
    // Template documents has no owner according to the spec
    if (isTemplate) {
      return null;
    }

    return dtoDoc.owner && this.authorMapper.fromDto(dtoDoc.owner_data);
  }
}

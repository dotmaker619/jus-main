import { JusLawFile } from '../models/juslaw-file';

import { getAvailableDocuSignTypesAsMimeTypes, MAX_DOCUMENT_SIZE_BYTES } from './docusign-restrictions';

/**
 * Namespace for everything connected to uploading files to s3 or DocuSign.
 */
export namespace JuslawFiles {

  export const AVAILABLE_TYPES_DOCUSIGN = getAvailableDocuSignTypesAsMimeTypes();
  export const AVAIALBLE_SIZE_DOCUSIGN = MAX_DOCUMENT_SIZE_BYTES;

  /** Validator for type of uploading docs. */
  // tslint:disable-next-line: completed-docs
  export function validateForRestrictedTypes(doc: JusLawFile): string | null {
    if (!(doc.file instanceof File)) {
      return;
    }

    if (AVAILABLE_TYPES_DOCUSIGN.includes(extractFileType(doc.file))) {
      return null;
    }
    return `${doc.name} were restricted because of type limitation.`;
  }

  /** Validator for limiting size of doc. */
  // tslint:disable-next-line: completed-docs
  export function validateForSizeLimitation(doc: JusLawFile): string | null {
    if (!(doc.file instanceof File)) {
      return;
    }

    if (doc.file.size < AVAIALBLE_SIZE_DOCUSIGN) {
      return null;
    }
    return `${doc.name} were ignored because of size limitation`;
  }

  /**
   * Extract MIME type of a file. Otherwise, if the system has no content type of the file, get its extension.
   * @param file File.
   */
  // tslint:disable-next-line: completed-docs
  function extractFileType(file: File): string {
    if (file.type) {
      return file.type;
    }
    const [fileType] = file.name.split('.').slice(-1);
    return `.${fileType}`;
  }
}

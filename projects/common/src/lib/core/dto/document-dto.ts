import { JuslawDocumentType } from '../models/document-type';

import { AuthorDto } from './author-dto';
import { MatterDto } from './matter-dto';

/** Document dto model. */
export interface DocumentDto {
  /** Document id. */
  id?: number;
  /** Owner id. */
  owner?: number;
  /** Owner. */
  owner_data?: AuthorDto;
  /** Matter id. */
  matter: number;
  /** Matter. */
  matter_data?: MatterDto;
  /** Document title. */
  title: string;
  /** Path. */
  path?: string[];
  /** Parent document id. */
  parent: number;
  /** Document type. */
  type?: 'Folder' | 'Document';
  /** File url. */
  file?: string;
  /** Mime type. */
  mime_type?: string;
  /** Id of creator. */
  created_by: number;
  /** Creator. */
  created_by_data?: AuthorDto;
  /** Date of creation. */
  created?: string;
  /** Date of last change. */
  modified?: string;
  /** Is shared folder. */
  is_shared?: boolean;
  /** Is document a template. */
  is_template?: boolean;
  /** Is document a global template (does not belong to a user). */
  is_global_template?: boolean;
}

import { AuthorDto } from './author-dto';

/** Call info dto model. */
export interface CallInfoDto {
  /** Call id. */
  id?: number;
  /** Call url. */
  call_url?: string;
  /** Participants ids. */
  participants: number[];
  /** Participants entities. */
  participants_data?: AuthorDto[];
}

import { ClientDto } from './client-dto';
import { MatterDto } from './matter-dto';

/** Note dto model. */
export interface NoteDto {
  /** Id. */
  id?: number;
  /** Title. */
  title: string;
  /** Text. */
  text: string;
  /** Matter. */
  matter: number;
  /** Matter data. */
  matter_data?: MatterDto;
  /** Created by. */
  created_by?: number;
  /** Created by data. */
  created_by_data?: ClientDto;
  /** Created. */
  created?: string;
  /** Modified. */
  modified?: string;
}

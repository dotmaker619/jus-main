import { AttorneyDto } from './attorney-dto';

/** Group chat DTO. */
export interface NetworkDto {
  /** Id. */
  id?: number;
  /** Title. */
  title: string;
  /** Chat channel id. */
  chat_channel?: string;
  /** Creator id. */
  creator?: number;
  /** Creator. */
  creator_data?: AttorneyDto;
  /** participants */
  participants: number[];
  /** Participants objects. */
  participants_data?: AttorneyDto[];
}

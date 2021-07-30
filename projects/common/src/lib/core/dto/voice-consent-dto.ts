import { MatterDto } from './matter-dto';

/** Voice consent dto model. */
export interface VoiceConsentDto {
  /** Voice consent id. */
  id: number;
  /** File url. */
  file: string;
  /** Matter id. */
  matter: number;
  /** Matter data. */
  matter_data?: Pick<MatterDto, 'id' | 'code' | 'title' | 'description'>;
  /** Title. */
  title: string;
}

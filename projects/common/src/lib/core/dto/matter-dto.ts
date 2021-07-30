import { MatterStatus } from '../models/matter-status';
import { Role } from '../models/role';

import { AttorneyDto } from './attorney-dto';
import { AuthorDto } from './author-dto';
import { CityDto } from './city-dto';
import { ClientDto } from './client-dto';
import { CountryDto } from './country-dto';
import { ESignDocumentDto, ESignEnvelopeDto } from './esign-envelop-dto';
import { LeadDto } from './lead-dto';
import { StageDto } from './stage-dto';
import { StateDto } from './state-dto';

type SharedWithUserDto = AuthorDto & {
  /** User type */
  user_type: Role,
};

/** Matter dto. */
export interface MatterDto {
  /** Id */
  id: number;
  /** Lead */
  lead: number;
  /** Lead data */
  lead_data?: LeadDto;
  /** Client */
  client: number;
  /** Client data */
  client_data?: ClientDto;
  /** Attorney */
  attorney?: number;
  /** Attorney data */
  attorney_data?: AttorneyDto;
  /** Code */
  code: string;
  /** Title */
  title: string;
  /** Description */
  description: string;
  /** Rate type */
  rate_type: 'hourly' | 'fixed_amount' | 'contingency_fee' | 'alternative';
  /** Rate */
  rate: string;
  /** Country */
  country: number;
  /** Country data */
  country_data?: CountryDto;
  /** State */
  state: number;
  /** State data */
  state_data?: StateDto;
  /** City*/
  city: CityDto;
  /** City data */
  city_data?: CityDto;
  /** Status */
  status: MatterStatus;
  /** Stage id */
  stage: number;
  /** Stage data */
  stage_data?: StageDto;
  /** Chat channel */
  chat_channel: string;
  /** Created */
  created: string;
  /** Modified */
  modified: string;
  /** Time billed for matter in minutes */
  time_billed: number;
  /** Fees earned */
  fees_earned?: number;
  /** Esign documents. */
  esign_documents: ESignDocumentDto[];
  /** Date of completion. */
  completed: string;
  /** Docusign envelope. */
  envelope_data?: ESignEnvelopeDto;
  /** Shared with */
  shared_with?: number[];
  /** Shared with data */
  shared_with_data?: SharedWithUserDto[];
  /** Is shared */
  is_shared?: boolean;
}

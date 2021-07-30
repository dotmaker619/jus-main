import { AttorneyDto } from './attorney-dto';
import { MatterDto } from './matter-dto';

/** Time billing dto model. */
export interface TimeBillingDto {
  /** Id */
  id: number;
  /** Matter */
  matter: number;
  /** Matter data */
  matter_data?: MatterDto;
  /** Invoice */
  invoice?: number;
  /** Description */
  description: string;
  /** Time spent */
  time_spent: string;
  /** Amount of money should be paid for a spent time */
  fees: string;
  /** Date in which billed work was made */
  date: string;
  /** Created */
  created?: string;
  /** Modified */
  modified?: string;
  /** ID of user who made a bill */
  created_by?: number;
  /** Attorney data. */
  created_by_data?: Partial<AttorneyDto>;
  /** Is billing log available for editing/ */
  available_for_editing: boolean;
}

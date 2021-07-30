import { VerificationStatus } from '../models/verification-status';

/** Staff dto. */
export interface StaffDto {
  /** Id */
  readonly id?: number;
  /** Given name. */
  readonly first_name?: string;
  /** Family name. */
  readonly last_name?: string;
  /** Email. */
  readonly email?: string;
  /** Avatar url. */
  readonly avatar: string;
  /** Short user description. */
  readonly description?: string;
  /** Verification status. */
  readonly verification_status: VerificationStatus;
  /** Is functionality paid. */
  readonly is_paid?: boolean;
}

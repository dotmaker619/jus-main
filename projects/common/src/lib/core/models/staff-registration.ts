import { Staff } from './staff';

type StaffRegistrationFields = Pick<Staff, 'description' | 'email' | 'firstName' | 'lastName' | 'verificationStatus'>;

/** Data for staff registration. */
export interface StaffRegistration extends StaffRegistrationFields {
  /** Avatar to upload. */
  readonly avatar: File;
  /** Password. */
  readonly password: string;
  /** Password confirmation. */
  readonly passwordConfirmation: string;
}

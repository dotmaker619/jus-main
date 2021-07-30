import { StaffDto } from './staff-dto';

/** Dto for staff registration. */
export interface StaffRegistrationDto extends StaffDto {
  /** Password. */
  password1: string;
  /** Password confirmation. */
  password2: string;
}

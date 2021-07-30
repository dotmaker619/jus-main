import { AttorneyDto } from './attorney-dto';

/**
 * Attorney registration DTO.
 */
export interface AttorneyRegistrationDto extends AttorneyDto {
  /**
   * Password.
   */
  password1: string;
  /**
   * Password confirmation.
   */
  password2: string;
  /**
   * Attached files.
   */
  registration_attachments: string[];
}

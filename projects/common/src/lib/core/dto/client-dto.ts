import { SpecialtyDto } from './specialty-dto';
import { StateDto } from './state-dto';

/**
 * Client DTO.
 */
export interface ClientDto {
  /**
   * ID.
   */
  id: number;
  /**
   * First name.
   */
  first_name: string;
  /**
   * Last name.
   */
  last_name: string;
  /**
   * Email.
   */
  email: string;
  /**
   * Avatar.
   */
  avatar: string;
  /**
   * State ID.
   */
  state: number;
  /**
   * State data.
   */
  state_data: StateDto;
  /**
   * Help description.
   */
  help_description: string;
  /**
   * Specialties identifiers.
   */
  specialities: number[];
  /**
   * Specialties.
   */
  specialities_data?: SpecialtyDto[];
  /**
   * Type of a client.
   */
  client_type?: 'individual' | 'firm';
  /**
   * Organization name.
   */
  organization_name?: string;
}

import { ClientDto } from './client-dto';

/** Invite data transfer object. */
export interface InviteDto {
  /** UUID. */
  uuid?: string;
  /** Client. */
  client?: ClientDto;
  /** First name */
  first_name: string;
  /** Last name. */
  last_name: string;
  /** Email. */
  email: string;
  /** Message of invitation/ */
  message: string;
  /** Date-time when invitation was sent. */
  sent?: string;
  /** Organization name. */
  organization_name?: string;
  /** Client type. */
  client_type?: ClientDto['client_type'];
}

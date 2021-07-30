import { User } from './user';

/** Network invitation. */
export interface NetworkInvitation {
  /** Invitation message. */
  message: string;
  /** Invitation participants. */
  participants: User[];
}

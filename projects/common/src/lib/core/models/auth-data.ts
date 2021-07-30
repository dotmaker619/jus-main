import { Role } from './role';

/** Successful login data. */
export interface AuthData {
  /** Authentication key */
  key: string;
  /** User type */
  role: Role;
}

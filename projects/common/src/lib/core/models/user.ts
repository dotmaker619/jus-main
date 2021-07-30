import { Role } from './role';

/**
 * Base user information.
 */
export class User {
  /**
   * ID.
   */
  public readonly id: number;

  /**
   * Avatar url.
   */
  public avatar: string | File;

  /**
   * First name.
   */
  public readonly firstName: string;

  /**
   * Last name.
   */
  public readonly lastName: string;

  /**
   * Email.
   */
  public readonly email: string;

  /**
   * User role.
   */
  public readonly role: Role;

  /**
   * Full user name.
   */
  public get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
  /**
   * Get property to obtain information about user
   * It's override by child classes
   * Base user model has no descriptions, so return empty string.
   */
  public get description(): string {
    return '';
  }

  /**
   * Return short client name.
   *
   * example:
   * John Doe => John D.
   */
  public get shortName(): string {
    return `${this.firstName} ${this.lastName.charAt(0)}.`;
  }

  public constructor(data: Partial<User>) {
    this.id = data.id;
    this.avatar = data.avatar;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.email = data.email;
    this.role = data.role;
  }
}

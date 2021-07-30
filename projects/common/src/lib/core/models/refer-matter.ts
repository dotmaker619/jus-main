import { Role } from './role';

/**
 * Model to refer matter.
 */
export class ReferMatter {
  /** Matter id. */
  public id: number;
  /** Sharing title */
  public title: string;
  /** Sharing message. */
  public message: string;
  /** ID's of selected users to share with. */
  public users: number[];
  /** List of users emails to share with. */
  public emails: string[];
  /** User type to share matter with. */
  public userType: Role.Attorney | Role.Staff;

  /**
   * @constructor
   *
   * @param data Initialize data.
   */
  public constructor(data: Partial<ReferMatter>) {
    this.id = data.id;
    this.title = data.title;
    this.message = data.message;
    this.users = data.users;
    this.emails = data.emails;
    this.userType = data.userType;
  }
}

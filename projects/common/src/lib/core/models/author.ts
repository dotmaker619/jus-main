/**
 * Author model.
 */
export class Author {
  /** Id. */
  public id: number;
  /** First Name. */
  public firstName: string;
  /** Last Name. */
  public lastName: string;
  /** Email. */
  public email: string;
  /** Avatar. */
  public avatar: string;

  /**
   * @constructor
   *
   * @param data Initialize data.
   */
  public constructor(data: Partial<Author>) {
    this.id = data.id;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.email = data.email;
    this.avatar = data.avatar;
  }

  /**
   * Return short author name.
   *
   * example:
   * John Doe => John D.
   */
  public get shortName(): string {
    return `${this.firstName} ${this.lastName.charAt(0)}.`;
  }

  /**
   * Full user name.
   */
  public get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}

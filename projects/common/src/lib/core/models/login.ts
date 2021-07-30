/** Class with Attorney's login information */
export class Login {
  /** Attorney's email */
  public email: string;
  /** Attorney's password */
  public password: string;

  /** @constructor */
  public constructor(credentials: Partial<Login>) {
    this.email = credentials.email;
    this.password = credentials.password;
  }
}

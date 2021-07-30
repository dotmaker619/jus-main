/** Class with base reset password information */
export class ResetPassword {
  /** User email to reset password */
  public email: string;

  /** @constructor */
  public constructor(credentials: Partial<ResetPassword>) {
    this.email = credentials.email;
  }
}

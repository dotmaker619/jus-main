/** Model to store password reset confirmation data */
export class ResetPasswordConfirmation {
  /** New password for user */
  public password1: string;
  /** Confirmation of new password */
  public password2: string;
  /** Token for password change */
  public resetPasswordToken: string;

  /** @constructor */
  public constructor(data: Partial<ResetPasswordConfirmation>) {
    this.password1 = data.password1;
    this.password2 = data.password2;
    this.resetPasswordToken = data.resetPasswordToken;
  }
}

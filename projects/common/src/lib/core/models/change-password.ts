/**
 * Author model.
 */
export class ChangePassword {
  /**
   * Current password.
   */
  public currentPassword: string;
  /**
   * New password.
   */
  public newPassword: string;
  /**
   * Confirm new password.
   */
  public confirmPassword?: string;

  /**
   * @constructor
   *
   * @param changePassword
   */
  public constructor(changePassword: Partial<ChangePassword>) {
    this.currentPassword = changePassword.currentPassword;
    this.newPassword = changePassword.newPassword;
    this.confirmPassword = changePassword.confirmPassword;
  }
}

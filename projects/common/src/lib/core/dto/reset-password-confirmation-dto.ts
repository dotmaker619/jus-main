/** Dto from reset password confirmation */
export interface ResetPasswordConfirmationDto {
  /** New password for user */
  new_password1: string;
  /** New password confirmation */
  new_password2: string;
  /** User id */
  uid: string;
  /** Password change token */
  token: string;
}

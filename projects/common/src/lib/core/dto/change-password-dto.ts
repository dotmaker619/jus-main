/**
 * Change password DTO.
 */
export interface ChangePasswordDto {
  /**
   * Old password.
   */
  old_password: string;
  /**
   * New password.
   */
  new_password1: string;
  /**
   * Confirmation.
   */
  new_password2: string;
}

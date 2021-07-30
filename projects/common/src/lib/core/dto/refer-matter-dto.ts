/**
 * Refer mapper dto model.
 */
export interface ReferMatterDto {
  /** Sharing title */
  title: string;
  /** Sharing message. */
  message: string;
  /** ID's of selected users to share with. */
  users: number[];
  /** List of users emails to share with. */
  emails: string[];
  /** User type. */
  user_type: 'attorney' | 'support';
}

/**
 * Payment method.
 */
export interface PaymentAccount {
  /** ID. */
  id: string;
  /** Method brand. */
  brand: string;
  /** Additional info. */
  additionalInfo: string;
  /** Last number of method. */
  last4: string;
  /** Is account verified. */
  isVerified: boolean;
}

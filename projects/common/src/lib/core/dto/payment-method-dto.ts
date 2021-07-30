/** Dto for payment method */
export interface PaymentMethodDto {
  /** Brand */
  brand: string;
  /** Expiration month */
  exp_month: number;
  /** Expiration year */
  exp_year: number;
  /** Last 4 digits */
  last4: string;
}

/** Payment plan dto. */
export interface PaymentPlanDto {
  /** Id */
  id: string;
  /** Amount (as decimal) to be charged on the interval specified */
  amount: string | null;
  /** Three-letter ISO currency code */
  currency: string;
  /** The frequency with which a subscription should be billed */
  interval: 'day' | 'month' | 'week' | 'year';
  /** A brief description of the plan, hidden from customers */
  nickname: string;
  /** The product whose pricing this plan determines. */
  product: number | null;
  /** Number of trial period days granted when subscribing a customer to this plan. Null if the plan has no trial period. */
  trial_period_days: number | null;
  /**
   * Plan description.
   */
  description: string;

  /**
   * Product data.
   */
  product_data: {
    /**
     * Name.
     */
    name: string;
  };
}

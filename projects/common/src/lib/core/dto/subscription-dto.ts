import { PaymentPlanDto } from './payment-plan-dto';

/**
 * Subscription DTO.
 */
export interface SubscriptionDto {
  /**
   * ID.
   */
  id: string;
  /**
   * Status.
   */
  status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';
  /**
   * Canceled At date time.
   */
  canceled_at: string;

  /**
   * Renewal date.
   */
  renewal_date: string;

  /**
   * Cancel at period end.
   */
  cancel_at_period_end: boolean;

  /**
   * Plan ID.
   */
  plan: number;

  /**
   * Payment plan data.
   */
  plan_data: PaymentPlanDto;
}

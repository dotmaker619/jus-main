import { PaymentMethod } from './payment-method';

export namespace JusLawSubscriptions {
  const STATUS_TITLE_MAP = new Map<Subscription['status'], string>([
    ['active', 'Active'],
    // Canceled means canceling was requested but the subscription will not be removed until the payment period is ended.
    ['canceled', 'Active'],
    ['incomplete', 'Active'],
    ['trialing', 'Trialing'],
    ['incomplete_expired', 'Incomplete Expired'],
    ['past_due', 'Past Due'],
    ['unpaid', 'Unpaid'],
  ]);

  /** These statuses might be considered as active. */
  const ACTIVE_STATUSES = [
    'active',
    'canceled',
    'incomplete',
    'trialing',
  ];

  /**
   * Subscription.
   * Described payment subscription.
   */
  export class Subscription {
    /**
     * ID.
     */
    public id: string;

    /**
     * Status.
     */
    public status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';

    /**
     * Renewal date
     */
    public renewalDate: Date | null;

    /**
     * Date of cancel.
     */
    public canceledDate: Date | null;

    /**
     * Payment plan for subscription.
     */
    public plan: PaymentPlan;

    /**
     * Status title.
     */
    public get statusTitle(): string {
      return STATUS_TITLE_MAP.get(this.status);
    }

    /**
     * Is current subscription active.
     */
    public get isActive(): boolean {
      return ACTIVE_STATUSES.includes(this.status);
    }

    /**
     * Is cancel at period end requested.
     */
    public cancelAtPeriodEnd: boolean;

    public constructor(data: Partial<Subscription>) {
      this.id = data.id;
      this.status = data.status;
      this.plan = data.plan;
      this.renewalDate = data.renewalDate || null;
      this.canceledDate = data.canceledDate || null;
      this.cancelAtPeriodEnd = data.cancelAtPeriodEnd;
    }
  }

  /**
   * Payment interval.
   */
  export enum PaymentInterval {
    /**
     * Day.
     */
    Day = 0,
    /**
     * Week.
     */
    Week,
    /**
     * Week.
     */
    Month,
    /**
     * Year.
     */
    Year,
  }

  export namespace PaymentInterval {
    const PAYMENT_INTERVAL_TO_TITLE_MAP: Record<PaymentInterval, string>  = {
      [PaymentInterval.Day]: 'Day',
      [PaymentInterval.Month]: 'Month',
      [PaymentInterval.Week]: 'Week',
      [PaymentInterval.Year]: 'Year',
    };

    /**
     * Convert a certain payment interval value to readable title.
     * @param value Payment interval value to get a title.
     */
    // tslint:disable-next-line: completed-docs
    export function toReadable(value: PaymentInterval): string {
      return PAYMENT_INTERVAL_TO_TITLE_MAP[value];
    }
  }

  const PAYMENT_INTERVAL_TO_DAYS_MAP = {
    [PaymentInterval.Day]: 1,
    [PaymentInterval.Month]: 30,
    [PaymentInterval.Week]: 7,
    [PaymentInterval.Year]: 364,
  };

  /**
   * Payment plan model.
   */
  export class PaymentPlan {
    /** Id */
    public id: string;
    /** Amount (as decimal) to be charged on the interval specified */
    public amount: number;
    /** Three-letter ISO currency code */
    public currency: string;
    /** The frequency with which a subscription should be billed */
    public interval: PaymentInterval;
    /** A brief description of the plan, hidden from customers */
    public nickname: string;
    /** The product whose pricing this plan determines. */
    public product: number;
    /** Number of trial period days granted when subscribing a customer to this plan. Null if the plan has no trial period. */
    public trialPeriodDays: number;

    /**
     * Plan title.
     */
    public name: string;

    /**
     * Plan description.
     */
    public description: string;

    /**
     * Payment plan interval title.
     */
    public readonly intervalTitle: string;

    /**
     * Amount per day.
     */
    public readonly amountPerDay: number;

    /**
     * Is plan "premium".
     */
    public isPremium: boolean;

    /**
     * @constructor
     * @param plan Initial data.
     */
    public constructor(plan: Partial<PaymentPlan> ) {
      this.amount = plan.amount;
      this.currency = plan.currency;
      this.id = plan.id;
      this.interval = plan.interval;
      this.name = plan.name;
      this.nickname = plan.nickname;
      this.product = plan.product;
      this.trialPeriodDays = plan.trialPeriodDays;
      this.intervalTitle = `1-${PaymentInterval.toReadable(this.interval).toLowerCase()}`;
      this.amountPerDay = parseFloat((this.amount / PAYMENT_INTERVAL_TO_DAYS_MAP[this.interval]).toFixed(2));
      this.description = plan.description;
      this.isPremium = plan.isPremium;
    }
  }

  /**
   * Payment profile model.
   * Presents information about payment profile (includes payment plan and payment method).
   */
  export class PaymentProfile {
    /**
     * ID.
     */
    public id: string;

    /**
     * Current subscription.
     */
    public subscription: Subscription | null;

    /**
     * Next subscription that will become current after current expired.
     */
    public nextSubscription: Subscription | null;

    /**
     * Payment method.
     */
    public method: PaymentMethod;

    /**
     * @constructor
     * @param data Initialized data.
     */
    public constructor(data: Partial<PaymentProfile>) {
      this.id = data.id;
      this.subscription = data.subscription;
      this.method = data.method;
      this.nextSubscription = data.nextSubscription;
    }
  }

}

/** Change plan text template interface. */
export interface ChangePlanTextTemplate {
  /** Header text. */
  header: string;
  /** Description text. */
  description: string;
  /** Charge info text template. */
  getChargeInfoText?: (amount: string) => string;
  /** Renewal date text template. */
  getRenewalDateInfoText: (date: string) => string;
}

/** Upgrade plan text template. */
export const UPGRADE_PLAN_TEXT: ChangePlanTextTemplate = {
  header: 'Upgrade Plan',
  description: 'Your upgrade to Premium will take place immediately upon confirmation.',
  getChargeInfoText: (amount: string) => `You will be charged ${amount} for the upgrade.`,
  getRenewalDateInfoText: (renewalDate?: string) => `Your new renewal date will be: ${renewalDate}`,
};

/** Downgrade plan text template. */
export const DOWNGRADE_PLAN_TEXT: ChangePlanTextTemplate = {
  header: 'Downgrade Plan',
  description: 'Your downgrade to Standard will take place when your current plan expires.',
  getRenewalDateInfoText: (renewalDate?: string) => `Your new renewal date will be: ${renewalDate}`,
};

/** Cancel subscription text. */
export const CANCEL_SUBSCRIPTION_TEXT = {
  header: 'Cancel Subscription',
  message1: 'Are you sure you want to cancel your subscription?',
  getMessage2: (expirationDate: string) =>
    `You will lose access to Jus-Law when your current subscription expires on ${expirationDate}.`,
};

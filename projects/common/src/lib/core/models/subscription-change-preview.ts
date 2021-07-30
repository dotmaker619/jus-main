/**
 * Subscription change preview.
 * Contains information about coming change if subscription changes.
 */
export class SubscriptionChangePreview {
  /**
   * Cost.
   */
  public cost: number | null;

  /**
   * Renewal date.
   */
  public renewalDate: Date;

  /**
   * Is change will be upgrade.
   */
  public get isUpgrade(): boolean {
    return this.cost != null;
  }

  /**
   * @constructor
   * @param data Initialized data.
   */
  public constructor(data: Partial<SubscriptionChangePreview>) {
    this.cost = data.cost == null
      ? null
      : data.cost;
    this.renewalDate = data.renewalDate;
  }
}

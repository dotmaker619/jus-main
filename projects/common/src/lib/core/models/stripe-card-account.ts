import { PaymentAccount } from './payment-account';

/**
 * Stripe card account information.
 */
export class StripeCardAccount implements PaymentAccount {
  /**
   * @constructor
   *
   * @param id Id.
   * @param brand Brand.
   * @param last4 Last4.
   * @param expMonth Expiration month.
   * @param expYear Expiration year.
   * @param isVerified Is account verified.
   */
  public constructor(
    public id: string,
    public brand: string,
    public last4: string,
    public expMonth: number,
    public expYear: number,
    public isVerified: boolean,
  ) { }

  /** Date of expiration. */
  public get additionalInfo(): string {
    return `${this.expMonth}/${this.expYear}`;
  }
}

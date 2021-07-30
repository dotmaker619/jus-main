import { PaymentAccount } from './payment-account';

/**
 * Stripe card account information.
 */
export class StripeBankAccount implements PaymentAccount {
  /** Brand. */
  public readonly brand: string;

  /**
   * @constructor
   *
   * @param id Id.
   * @param last4 Last4.
   * @param bankName Bank name.
   * @param isVerified Is verified.
   */
  public constructor(
    public id: string,
    public last4: string,
    public bankName: string,
    public isVerified: boolean,
  ) {
    this.brand = 'Bank account';
  }

  /** Date of expiration. */
  public get additionalInfo(): string {
    return this.bankName;
  }
}

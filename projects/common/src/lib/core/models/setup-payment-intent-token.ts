/**
 * Setup payment intent token.
 */
export class SetupPaymentIntentToken {
  /**
   * Client secret.
   */
  public readonly clientSecret: string;

  /**
   * @constructor
   * @param data Initialize data.
   */
  public constructor(data: Partial<SetupPaymentIntentToken>) {
    this.clientSecret = data.clientSecret;
  }
}

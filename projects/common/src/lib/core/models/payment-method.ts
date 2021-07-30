/**
 * Payment method.
 */
export class PaymentMethod {
  /**
   * Brand
   */
  public brand: string;

  /**
   * Expiration month
   */
  public expMonth: number;

  /**
   * Expiration year
   */
  public expYear: number;

  /**
   * Last 4 digits
   */
  public last4: string;

  /**
   * @constructor
   * @param data Initialized data.
   */
  public constructor(data: Partial<PaymentMethod>) {
    this.brand = data.brand;
    this.expMonth = data.expMonth;
    this.expYear = data.expYear;
    this.last4 = data.last4;
  }
}

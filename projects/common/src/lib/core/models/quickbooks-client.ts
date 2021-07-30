/** Attorney's client from QuickBooks service. */
export class QuickbooksClient {
  /** Id. */
  public readonly id: number;
  /** First name. */
  public readonly firstName: string;
  /** Last name. */
  public readonly lastName: string;
  /** Display name. */
  public readonly displayName: string;
  /** Email. */
  public readonly email: string;
  /** Company name. */
  public readonly companyName: string;

  /** @constructor */
  public constructor(
    data: QuickbooksClient,
  ) {
    this.id = data.id;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.displayName = data.displayName;
    this.email = data.email;
    this.companyName = data.companyName;
  }
}

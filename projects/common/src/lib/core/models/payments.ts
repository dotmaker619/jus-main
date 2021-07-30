/** Contains all the interfaces for payments logic. */
export namespace JusLawPayments {
  /** Payment status. */
  export enum PaymentStatus {
    /** Payment in progress */
    InProgress = 'in_progress',
    /** Payment failed */
    Failed = 'failed',
    /** Payment canceled */
    Canceled = 'canceled',
    /** Payment succeeded */
    Succeeded = 'succeeded',
  }

  /** Type of payment. */
  export enum PaymentType {
    /** Payment for the invoice. */
    InvoicePayment = 'invoice',
    /** Fee for using staff functionality. */
    StaffFee = 'support',
  }

  /** Payments secret data. */
  export interface PaymentSecret {
    /** Payment session token. */
    readonly clientSecret: string;
    /** Status. */
    readonly status: string;
  }

  /** Payment info interface. */
  export interface PaymentInfo {
    /** Id. */
    readonly id: number;
    /** Payer id. */
    readonly payerId: number;
    /** Recipient id. */
    readonly recipientId: number;
    /** Amount. */
    readonly amount: string;
    /** Description. */
    readonly description: string;
    /** Status. */
    readonly status: PaymentStatus;
    /** Paymentsecret. */
    readonly paymentSecret: PaymentSecret;
  }
}

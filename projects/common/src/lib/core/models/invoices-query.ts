import { InvoiceStatus, InvoicePaymentStatus } from './invoice-status';

export namespace InvoiceQuery {
  /** Invoices query interface. */
  export interface InvoicesQuery {
    /** Combination of statuses. */
    statuses?: InvoiceStatusQuery;
    /** Limit of items. */
    limit?: number;
    /** From date. */
    fromDate?: Date;
    /** To date. */
    toDate?: Date;
    /** Title. */
    query?: string;
    /** Client. */
    client?: number[];
    /** Ordering. */
    order?: string;
    /** User ID */
    createdBy?: number;
  }

  /**
   * Complex invoice status.
   *
   * @description
   * Contains of combination of two statuses:
   *  * invoice status - depends on whether the status is sent by attorney or still pending,
   *  * payment status - shows the status of payment (mostly regulated by client)
   */
  export interface InvoiceStatusQuery {
    /** Statuses. */
    readonly statuses?: InvoiceStatus[];
    /** Payment statuses of invoice. */
    readonly paymentStatuses?: InvoicePaymentStatus[];
  }

  /** Complex config of statuses for paid invoices. */
  export const STATUS_PAID: InvoiceStatusQuery = {
    statuses: [InvoiceStatus.Sent],
    paymentStatuses: [
      InvoicePaymentStatus.Paid,
      InvoicePaymentStatus.PaymentFailed,
      InvoicePaymentStatus.PaymentProgress,
    ],
  };

  /** Complex config of statuses for unpaid invoices. */
  export const STATUS_UNPAID: InvoiceStatusQuery = {
    statuses: [InvoiceStatus.Sent],
    paymentStatuses: [
      InvoicePaymentStatus.NotStarted,
    ],
  };
}

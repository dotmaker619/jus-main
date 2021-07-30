/** Invoice status */
export enum InvoiceStatus {
  /** Pending */
  Pending = 'pending',
  /** Sent */
  Sent = 'sent',
}

/** Invoice payment status. */
export enum InvoicePaymentStatus {
  /** Payment is not started. */
  NotStarted = 'not_started',
  /** Paid */
  Paid = 'paid',
  /** Payment in progress */
  PaymentProgress = 'payment_in_progress',
  /** Payment was failed */
  PaymentFailed = 'payment_failed',
}

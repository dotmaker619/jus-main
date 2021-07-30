import { JusLawPayments } from '../models/payments';

/** Payment action dto. */
export interface PaymentActionDto {
  /** Type of payment we want to process. */
  readonly object_type: string;
  /** Id of the object connected with payment. (e.g. for invoice payment, object_id is id of an invoice) */
  readonly object_id: number;
}

/** Invoice payment action. */
export interface InvoicePaymentDto extends PaymentActionDto {
  /** @inheritdoc */
  readonly object_type: JusLawPayments.PaymentType.InvoicePayment;
}

/** Staff fee payment action. */
export interface StaffFeePaymentDto extends PaymentActionDto {
  /** @inheritdoc */
  readonly object_type: JusLawPayments.PaymentType.StaffFee;
}

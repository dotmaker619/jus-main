import { Attorney } from './attorney';
import { Client } from './client';
import { InvoiceStatus, InvoicePaymentStatus } from './invoice-status';
import { Matter } from './matter';

const PAYMENT_STATUS_TO_READABLE: Record<InvoicePaymentStatus, string> = {
  [InvoicePaymentStatus.NotStarted]: 'Unpaid',
  [InvoicePaymentStatus.PaymentFailed]: 'Payment Failed',
  [InvoicePaymentStatus.PaymentProgress]: 'Payment in Progress',
  [InvoicePaymentStatus.Paid]: 'Paid',
};

const PAYMENT_AVAILABLE_STATUSES = [
  InvoicePaymentStatus.NotStarted,
  InvoicePaymentStatus.PaymentProgress,
  InvoicePaymentStatus.PaymentFailed,
];

interface ComplexInvoiceStatus {
  /** Status of the invoice. Shows whether the invoice is sent or pending. */
  readonly status: InvoiceStatus;
  /** Status of payment. */
  readonly paymentStatus: InvoicePaymentStatus;
}

/** Invoice model */
export class Invoice {
  /** Identifier */
  public id: number;
  /** Title */
  public title: string;
  /** A note left by attorney */
  public note: string;
  /** Status */
  public status: ComplexInvoiceStatus;
  /** Related matter model */
  public matter: Matter;
  /** Related client model */
  public client: Client;
  /** Start date from which invoice money amount is calculated */
  public periodStart: string;
  /** End date till which invoice money amount is calculated */
  public periodEnd: string;
  /** Created at */
  public created: string;
  /** Modified at */
  public modified: string;
  /** Download URL. */
  public downloadUrl: string;
  /** Can be paid. */
  public canBePaid: boolean;
  /** Attorney */
  public attorney: Attorney;

  /**
   * Download file name.
   */
  public get downloadFileName(): string {
    return `${this.title}.pdf`;
  }

  /** @constructor */
  constructor(invoice: Partial<Invoice>) {
    this.id = invoice.id;
    this.title = invoice.title;
    this.note = invoice.note;
    this.status = invoice.status;
    this.matter = invoice.matter;
    this.client = invoice.client;
    this.periodStart = invoice.periodStart;
    this.periodEnd = invoice.periodEnd;
    this.created = invoice.created;
    this.modified = invoice.modified;
    this.downloadUrl = invoice.downloadUrl;
    this.canBePaid = invoice.canBePaid;
    this.attorney = invoice.attorney;
  }

  /**
   * Is payment available for the invoice.
   */
  public get isPaymentAvailable(): boolean {
    return this.canBePaid && PAYMENT_AVAILABLE_STATUSES.includes(this.status.paymentStatus);
  }

  /** Is invoice paid. */
  public get isPaid(): boolean {
    return this.status.paymentStatus === InvoicePaymentStatus.Paid;
  }

  /** Human-readable payment status. */
  public get readablePaymentStatus(): string {
    return PAYMENT_STATUS_TO_READABLE[this.status.paymentStatus];
  }

  /** Is invoice editable. */
  public get isEditable(): boolean {
    return this.status.paymentStatus !== InvoicePaymentStatus.Paid
      && this.status.paymentStatus !== InvoicePaymentStatus.PaymentProgress;
  }
}

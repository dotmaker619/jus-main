/** Send invoice model */
export class SendInvoice {
  /** Recipient list */
  public recipientList: string[];
  /** Note */
  public note: string;

  /** @constructor */
  public constructor(sendInvoice: Partial<SendInvoice>) {
    this.recipientList = sendInvoice.recipientList;
    this.note = sendInvoice.note;
  }
}

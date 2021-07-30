/** Send invoice dto */
export interface SendInvoiceDto {
  /** Recipient list */
  recipient_list: string[];
  /** Note */
  note: string;
  /** Field used only for validation purposes */
  fees_earned: never;
}

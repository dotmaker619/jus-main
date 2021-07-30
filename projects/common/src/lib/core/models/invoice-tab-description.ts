import { InvoiceQuery } from './invoices-query';

/**
 * Invoice tab description.
 */
export interface InvoicesTabDescription {
  /** Invoice tab name. */
  name: string;
  /** Invoice tab status. */
  status: InvoiceQuery.InvoiceStatusQuery;
}

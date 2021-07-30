import { InvoicePaymentStatus } from '../models/invoice-status';

import { AttorneyDto } from './attorney-dto';
import { ClientDto } from './client-dto';
import { MatterDto } from './matter-dto';

/** Dto for invoice model */
export interface InvoiceDto {
  /** Identifier */
  id: number;
  /** Matter identifier */
  matter: number;
  /** Matter data */
  matter_data?: MatterDto;
  /** Client identifier */
  client: number;
  /** Client data */
  client_data?: ClientDto;
  /** Start date from which invoice money amount is calculated */
  period_start: string;
  /** End date till which invoice money amount is calculated */
  period_end: string;
  /** Status */
  status?: 'pending' | 'sent';
  /** Title which describes current invoice */
  title: string;
  /** A note left by attorney */
  note: string;
  /** Created at */
  created?: string;
  /** Modified at */
  modified?: string;
  /** Is payment available for the invoice. */
  can_be_paid?: boolean;
  /** Payment status. */
  payment_status?: InvoicePaymentStatus;
  /** Attorney id. */
  attorney: number;
  /** Attorney data. */
  attorney_data?: AttorneyDto;
}

import { JusLawPayments } from '../models/payments';

interface PaymentSecretDto {
  /** Payment session token. */
  readonly client_secret: string;
  /** Payment status. */
  readonly status: string;
}

/** Payment info dto. */
export interface PaymentInfoDto {
  /** Id. */
  id: number;
  /** Payer id. */
  payer: number;
  /** Id of a payment recipient. */
  recipient: number;
  /** Amount. */
  amount: string;
  /** Amount of money that would be taken from amount to the owner of app */
  application_fee_amount: string;
  /** Description. */
  description: string;
  /** Status. */
  status: JusLawPayments.PaymentStatus;
  /** Payment secret data. */
  payment_object_data: PaymentSecretDto;
}

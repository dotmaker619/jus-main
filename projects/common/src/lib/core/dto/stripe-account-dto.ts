export namespace StripeDTOs {
  type CapabilitiesVal = 'active' | 'inactive';

  interface Capabilities {
    /** Transfers. */
    transfers: CapabilitiesVal;
    /** Card_payments. */
    card_payments: CapabilitiesVal;
    /** Tax_reporting_us_1099_k. */
    tax_reporting_us_1099_k: CapabilitiesVal;
    /** Tax_reporting_us_1099_misc. */
    tax_reporting_us_1099_misc: CapabilitiesVal;
  }

  /**
   * Stripe account DTO.
   * This is a proxy model that our backend team sends to use. DON'T use it with stripe.js methods.
   */
  export interface AccountDto {
    /** Id. */
    id: string;
    /** Charges_enabled. */
    charges_enabled: boolean;
    /** Payouts_enabled. */
    payouts_enabled: boolean;
    /** Requirements. */
    requirements: string;
    /** Capabilities. */
    capabilities: Capabilities;
    /** Card account info. */
    card_external_account: CardAccountDto | null;
    /** Bank account info */
    bank_external_account: null;
    /** Is account verified. */
    is_verified: boolean;
  }

  type PayoutMethods = 'standard' | 'instant';

  /**
   * Card account dto.
   */
  export interface CardAccountDto {
    /** Id. */
    id: string;
    /** Name. */
    name: string | null;
    /** Brand. */
    brand: string;
    /** Last4. */
    last4: string;
    /** Object. */
    object: string;
    /** Account. */
    account: string;
    /** Country. */
    country: string;
    /** Funding. */
    funding: string;
    /** Currency. */
    currency: string;
    /** Exp_year. */
    exp_year: number;
    /** Metadata. */
    metadata: {};
    /** Cvc_check. */
    cvc_check: string | null;
    /** Exp_month. */
    exp_month: number;
    /** Address_zip. */
    address_zip: string | null;
    /** Fingerprint. */
    fingerprint: string;
    /** Address_city. */
    address_city: string | null;
    /** Address_line1. */
    address_line1: string | null;
    /** Address_line2. */
    address_line2: string | null;
    /** Address_state. */
    address_state: string | null;
    /** Dynamic_last4. */
    dynamic_last4: string | null;
    /** Address_country. */
    address_country: string | null;
    /** Address_zip_check. */
    address_zip_check: string | null;
    /** Address_line1_check. */
    address_line1_check: string | null;
    /** Tokenization_method. */
    tokenization_method: string | null;
    /** Default_for_currency. */
    default_for_currency: boolean;
    /** Available_payout_methods. */
    available_payout_methods: PayoutMethods[];
  }

  /**
   * Bank account dto.
   */
  export interface BankAccountDto {
    /** Id. */
    id: string;
    /** Last4. */
    last4: string;
    /** Object. */
    object: string;
    /** Status. */
    status: string;
    /** Account. */
    account: string;
    /** Country. */
    country: string;
    /** Currency. */
    currency: string;
    /** Metadata. */
    metadata: {};
    /** Bank_name. */
    bank_name: string;
    /** Fingerprint. */
    fingerprint: string;
    /** Routing_number. */
    routing_number: string;
    /** Account_holder_name. */
    account_holder_name: string | null;
    /** Account_holder_type. */
    account_holder_type: string | null;
    /** Default_for_currency. */
    default_for_currency: boolean;
  }
}

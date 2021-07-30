import { Injectable } from '@angular/core';

import { AppConfigService } from './app-config.service';

/** Stripe error codes. */
enum StripeErrorCode {
  /**
   * The provided payment method’s state was incompatible with the operation you were trying to perform.
   * It most likely means that server didn't get the response from Stripe yet and payment may be considered as in progress.
   *
   * @see https://stripe.com/docs/error-codes#payment-intent-unexpected-state
   */
  UnexpectedState = 'payment_intent_unexpected_state',
}

/**
 * Map stripe error to our domain-specific and human-readable message.
 * @param code Stripe error code.
 */
function mapStripeError(error: stripe.Error): Error {
  if (StripeErrorCode.UnexpectedState === error.code) {
    return new Error('Probably, payment is already in progress, please update the page after some time');
  }

  return new Error(error.message);
}

/** Payment service based on stripe API. */
@Injectable({ providedIn: 'root' })
export class StripeService {
  /** Stripe API. */
  private readonly stripe: stripe.Stripe;

  /**
   * @constructor
   * @param appConfig App config.
   */
  public constructor(
    appConfig: AppConfigService,
  ) {
    this.stripe = Stripe(appConfig.stripeConfig.publicKey, {
      locale: appConfig.stripeConfig.locale,
    });
  }

  /**
   * Confirm stripe payment.
   * @param clientSecret Payment session token for client.
   * @param cardToken Card token. Obtained from stripe form element.
   */
  public async confirmPayment(
    clientSecret: string,
    cardToken: string,
  ): Promise<void> {
    const {
      paymentIntent,
      error,
    } = await this.stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: cardToken,
      },
    );

    // Payment error
    if (error != null) {
      return Promise.reject(mapStripeError(error));
    }

    if (paymentIntent.status === 'succeeded') {
      // Payment success
      return null;
    }

    // Payment wasn't processed (user closed the confirmation window for example)
    return Promise.reject(new Error('Payment wasn\'t processed'));
  }

}

import { SetupPaymentIntentTokenDto } from '../dto/setup-payment-intent-token-dto';
import { SetupPaymentIntentToken } from '../models/setup-payment-intent-token';

import { MapperFromDto } from './mapper';

/**
 * Setup intent token mapper.
 */
export class SetupPaymentIntentTokenMapper implements MapperFromDto<SetupPaymentIntentTokenDto, SetupPaymentIntentToken> {
  /**
   * @inheritdoc
   */
  public fromDto(data: SetupPaymentIntentTokenDto): SetupPaymentIntentToken {
    return new SetupPaymentIntentToken({
      clientSecret: data.client_secret,
    });
  }
}

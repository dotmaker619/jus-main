import { Injectable } from '@angular/core';

import { ValidationErrorDto } from '../dto';
import { PaymentProfileDto } from '../dto/payment-profile-dto';
import { extractErrorMessage } from '../dto/validation-error-dto';
import { TEntityValidationErrors } from '../models/api-error';
import { JusLawSubscriptions as jls } from '../models/subscriptions';

import { MapperFromDtoWithErrors } from './mapper';
import { PaymentMethodMapper } from './payment-method.mapper';
import { SubscriptionMapper } from './subscription.mapper';

/**
 * Payment profile mapper.
 */
@Injectable({ providedIn: 'root' })
export class PaymentProfileMapper implements MapperFromDtoWithErrors<PaymentProfileDto, jls.PaymentProfile> {
  private readonly paymentMethodMapper = new PaymentMethodMapper();
  private readonly subscriptionMapper = new SubscriptionMapper();

  /** @inheritdoc */
  public fromDto(data: PaymentProfileDto): jls.PaymentProfile {
    return new jls.PaymentProfile({
      id: data.id,
      subscription: this.subscriptionMapper.fromDto(data.subscription_data),
      method: this.paymentMethodMapper.fromDto(data.payment_method_data),
      nextSubscription: this.subscriptionMapper.fromDto(data.next_subscription_data),
    });
  }

  /**
   * @inheritdoc
   */
  public validationErrorFromDto(
    errorDto: ValidationErrorDto<PaymentProfileDto> | null | undefined,
  ): TEntityValidationErrors<jls.PaymentProfile> {
    if (errorDto == null) {
      return null;
    }
    return {
      method: extractErrorMessage(errorDto.payment_method),
      subscription: extractErrorMessage(errorDto.subscription_data),
    };
  }
}

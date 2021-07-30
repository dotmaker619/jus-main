import { ValidationErrorDto } from '../dto';
import { SubscriptionDto } from '../dto/subscription-dto';
import { extractErrorMessage } from '../dto/validation-error-dto';
import { TEntityValidationErrors } from '../models/api-error';
import { JusLawSubscriptions as jls } from '../models/subscriptions';

import { MapperFromDtoWithErrors } from './mapper';
import { PaymentPlanMapper } from './payment-plan.mapper';

/**
 * Subscription mapper.
 */
export class SubscriptionMapper implements MapperFromDtoWithErrors<SubscriptionDto, jls.Subscription> {
  private readonly paymentPlanMapper = new PaymentPlanMapper();

  /**
   * Create Subscription domain model from DTO.
   * @param subscriptionDto Subscription DTO instance.
   */
  public fromDto(subscriptionDto: SubscriptionDto | null): jls.Subscription | null {
    if (subscriptionDto == null) {
      return null;
    }
    const plan = this.paymentPlanMapper.fromDto(subscriptionDto.plan_data);
    const renewalDate = subscriptionDto.renewal_date == null
      ? null
      : new Date(subscriptionDto.renewal_date);
    const canceledDate = subscriptionDto.canceled_at == null
      ? null
      : new Date(subscriptionDto.canceled_at);
    return new jls.Subscription({
      plan,
      renewalDate,
      canceledDate,
      id: subscriptionDto.id,
      status: subscriptionDto.status,
      cancelAtPeriodEnd: subscriptionDto.cancel_at_period_end,
    });
  }

  /**
   * @inheritdoc
   */
  public validationErrorFromDto(errorDto: ValidationErrorDto<SubscriptionDto>): TEntityValidationErrors<jls.Subscription> {
    if (errorDto == null) {
      return null;
    }
    return {
      plan: extractErrorMessage(errorDto.plan),
    };
  }
}

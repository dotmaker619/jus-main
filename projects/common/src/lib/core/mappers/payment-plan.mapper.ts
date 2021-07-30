import { Injectable } from '@angular/core';

import { PaymentPlanDto } from '../dto/payment-plan-dto';
import { JusLawSubscriptions as jls } from '../models/subscriptions';

import { MapperFromDto } from './mapper';

const PREMIUM_PLAN_NICKNAME = 'premium';

/** Payment plan mapper. */
@Injectable({providedIn: 'root'})
export class PaymentPlanMapper implements MapperFromDto<PaymentPlanDto, jls.PaymentPlan> {

  /** @inheritdoc */
  public fromDto(data: PaymentPlanDto): jls.PaymentPlan {
    if (!data) {
      return null;
    }

    return new jls.PaymentPlan({
      amount: parseFloat(data.amount),
      currency: data.currency.toUpperCase(),
      id: data.id,
      interval: this.paymentIntervalFromDto(data.interval),
      nickname: data.nickname,
      name: data.product_data.name,
      product: data.product,
      trialPeriodDays: data.trial_period_days,
      description: data.description,
      isPremium: data.nickname === PREMIUM_PLAN_NICKNAME,
    });
  }

  private paymentIntervalFromDto(intervalDto: PaymentPlanDto['interval']): jls.PaymentInterval {
    switch (intervalDto) {
      case 'day':
        return jls.PaymentInterval.Day;
      case 'month':
        return jls.PaymentInterval.Month;
      case 'week':
        return jls.PaymentInterval.Week;
      case 'year':
        return jls.PaymentInterval.Year;
    }
    throw new Error(`An unexpected payment plan is got ${intervalDto}`);
  }
}

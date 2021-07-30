import { Injectable } from '@angular/core';
import { PaymentMethodDto } from '@jl/common/core/dto/payment-method-dto';
import { PaymentMethod } from '@jl/common/core/models/payment-method';

import { MapperFromDto } from './mapper';

/** Payment method mapper. */
@Injectable({ providedIn: 'root' })
export class PaymentMethodMapper implements MapperFromDto<PaymentMethodDto, PaymentMethod> {
  /** @inheritdoc */
  public fromDto(data: PaymentMethodDto): PaymentMethod {
    return new PaymentMethod({
      brand: data.brand,
      expMonth: data.exp_month,
      expYear: data.exp_year,
      last4: data.last4,
    });
  }
}

import { SubscriptionChangePreviewDto } from '../dto/subscription-change-preview-dto';
import { SubscriptionChangePreview } from '../models/subscription-change-preview';

import { MapperFromDto } from './mapper';

export class SubscriptionChangePreviewMapper implements MapperFromDto<SubscriptionChangePreviewDto, SubscriptionChangePreview> {
  /**
   * @inheritdoc
   */
  public fromDto(data: SubscriptionChangePreviewDto): SubscriptionChangePreview {
    const cost = data.cost == null
      ? null
      : parseInt(data.cost, 10);
    return new SubscriptionChangePreview({
      cost,
      renewalDate: new Date(data.new_renewal_date),
    });
  }
}

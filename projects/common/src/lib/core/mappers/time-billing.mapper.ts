import { ValidationErrorDto } from '../dto';
import { TimeBillingDto } from '../dto/time-billing-dto';
import { extractErrorMessage } from '../dto/validation-error-dto';
import { TEntityValidationErrors } from '../models/api-error';
import { Role } from '../models/role';
import { TimeBilling } from '../models/time-billing';
import { User } from '../models/user';

import { MapperWithErrors } from './mapper';
import { MatterMapper } from './matter.mapper';

interface EditableTimeBillingDto extends TimeBillingDto {
  /** Is time billing editable */
  isEditableForCurrentUser: boolean;
}

/** Time billing mapper. */
export class TimeBillingMapper implements MapperWithErrors<EditableTimeBillingDto, TimeBilling> {

  private matterMapper = new MatterMapper();

  /** @inheritdoc */
  public fromDto(data: EditableTimeBillingDto): TimeBilling {
    // Parse spent time from "hh:mm:ss" to number of minutes.
    const [hours, minutes] = data.time_spent.split(':')
      .map(part => Number.parseInt(part, 10));

    const spentMinutes = hours * 60 + minutes;

    return new TimeBilling({
      spentMinutes,
      id: data.id,
      matter: this.matterMapper.fromDto(data.matter_data),
      invoice: data.invoice,
      description: data.description,
      fees: data.fees,
      date: data.date,
      created: data.created,
      modified: data.modified,
      createdBy: new User({
        avatar: data.created_by_data.avatar,
        email: data.created_by_data.email,
        firstName: data.created_by_data.first_name,
        lastName: data.created_by_data.last_name,
        id: data.created_by_data.id,
        role: Role.Attorney,
      }),
      isEditable: data.available_for_editing,
      isEditableForCurrentUser: data.isEditableForCurrentUser,
    });
  }

  /** @inheritdoc */
  public toDto(data: TimeBilling): TimeBillingDto {
    // Convert to API format "hh:mm:ss"
    const spentHours = Math.floor(data.spentMinutes / 60);
    const spentMinutes = Math.floor(data.spentMinutes % 60);
    const timeSpent = `${spentHours}:${spentMinutes}:00`;

    return {
      id: data.id,
      invoice: data.invoice,
      matter: data.matter.id,
      description: data.description,
      time_spent: timeSpent,
      fees: data.fees,
      date: this.formatDate(new Date(data.date)),
      available_for_editing: data.isEditable,
    };
  }

  /** @inheritdoc */
  public validationErrorFromDto(errorDto: ValidationErrorDto<TimeBillingDto> | null | undefined): TEntityValidationErrors<TimeBilling> {
    return {
      spentMinutes: extractErrorMessage(errorDto.time_spent),
      invoice: extractErrorMessage(errorDto.invoice),
    };
  }

  /**
   * Format date (yyyy-MM-dd).
   * Time billings API requires special date format.
   * @param date
   */
  public formatDate(date: Date): string {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  }
}

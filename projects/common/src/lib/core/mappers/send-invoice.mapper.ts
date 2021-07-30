import { Injectable } from '@angular/core';

import { SendInvoiceDto } from '../dto/send-invoice-dto';
import { ValidationErrorDto, extractErrorMessage } from '../dto/validation-error-dto';
import { TEntityValidationErrors } from '../models/api-error';
import { SendInvoice } from '../models/send-invoice';

import { MapperWithErrors } from './mapper';

@Injectable({ providedIn: 'root' })
export class SendInvoiceMapper implements MapperWithErrors<SendInvoiceDto, SendInvoice> {
  /** @inheritdoc */
  public validationErrorFromDto(errorDto: ValidationErrorDto<SendInvoiceDto>): TEntityValidationErrors<SendInvoice> {
    const recListErrorKeys = Object.keys(errorDto.recipient_list || {});
    const isRecipientListError = recListErrorKeys.length > 0;
    const error: TEntityValidationErrors<SendInvoice> = {
      note: extractErrorMessage(errorDto.note) || extractErrorMessage(errorDto.fees_earned),
    };

    if (isRecipientListError) {
      error.recipientList = 'Some of emails are not valid';
      recListErrorKeys.forEach(key => {
        error[key] = extractErrorMessage(errorDto.recipient_list[key]);
      });
    }

    return error;
  }

  /** @inheritdoc */
  public fromDto(data: SendInvoiceDto): SendInvoice {
    return data && new SendInvoice({
      recipientList: data.recipient_list,
      note: data.note,
    });
  }

  /** @inheritdoc */
  public toDto(data: SendInvoice): SendInvoiceDto {
    return data && {
      recipient_list: data.recipientList,
      note: data.note,
    } as SendInvoiceDto;
  }
}

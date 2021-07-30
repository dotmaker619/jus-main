import { InvoiceDto } from '@jl/common/core/dto/invoice-dto';
import { ClientMapper } from '@jl/common/core/mappers/client.mapper';
import { IMapper, ValidationErrorMapper } from '@jl/common/core/mappers/mapper';
import { MatterMapper } from '@jl/common/core/mappers/matter.mapper';
import { Invoice } from '@jl/common/core/models/invoice';
import { InvoiceStatus } from '@jl/common/core/models/invoice-status';

import { ValidationErrorDto, extractErrorMessage } from '../dto/validation-error-dto';
import { TEntityValidationErrors } from '../models/api-error';
import { JusLawDateUtils } from '../utils/date-utils';

import { AttorneyMapper } from './attorney.mapper';

/** Invoice mapper. */
export class InvoiceMapper implements IMapper<InvoiceDto, Invoice>, ValidationErrorMapper<InvoiceDto, Invoice> {
  private readonly matterMapper = new MatterMapper();
  private readonly clientMapper = new ClientMapper();
  private readonly attorneyMapper = new AttorneyMapper();

  /**
   * @constructor
   * @param baseInvoicesUrl Bae invoices url to be able download an invoice.
   */
  public constructor(
    private baseInvoicesUrl: string,
  ) { }

  /** @inheritdoc */
  public fromDto(data: InvoiceDto): Invoice {
    return new Invoice({
      id: data.id,
      title: data.title,
      note: data.note,
      status: {
        status: data.status as InvoiceStatus,
        paymentStatus: data.payment_status,
      },
      matter: this.matterMapper.fromDto(data.matter_data),
      client: this.clientMapper.fromDto(data.client_data),
      periodStart: data.period_start,
      periodEnd: data.period_end,
      created: data.created,
      modified: data.modified,
      downloadUrl: new URL(`${data.id}/export/`, this.baseInvoicesUrl).toString(),
      canBePaid: data.can_be_paid,
      attorney: this.attorneyMapper.fromDto(data.attorney_data),
    });
  }

  /** @inheritdoc */
  public validationErrorFromDto(errorDto: ValidationErrorDto<InvoiceDto>): TEntityValidationErrors<Invoice> {
    return {
      client: extractErrorMessage(errorDto.client),
      title: extractErrorMessage(errorDto.title),
      matter: extractErrorMessage(errorDto.matter),
      note: extractErrorMessage(errorDto.note),
      periodEnd: extractErrorMessage(errorDto.period_end),
      periodStart: extractErrorMessage(errorDto.period_start),
    };
  }

  /** @inheritdoc */
  public toDto(data: Partial<Invoice>): InvoiceDto {
    return {
      client: data.client && data.client.id,
      id: data.id,
      matter: data.matter && data.matter.id,
      note: data.note,
      period_end: JusLawDateUtils.formatDate(new Date(data.periodEnd)),
      period_start: JusLawDateUtils.formatDate(new Date(data.periodStart)),
      title: data.title,
      attorney: data.attorney && data.attorney.id,
    };
  }
}

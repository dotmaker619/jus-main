import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Invoice } from '@jl/common/core/models/invoice';
import { RateType } from '@jl/common/core/models/rate-type';
import { BillingPagination } from '@jl/common/core/services/attorney/time-billing.service';
import { JusLawDateUtils } from '@jl/common/core/utils/date-utils';

/**
 * Table with invoice info.
 */
@Component({
  selector: 'jlcl-invoice-info-table',
  templateUrl: './invoice-info-table.component.html',
  styleUrls: ['./invoice-info-table.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceInfoTableComponent {

  /** Billings info. */
  @Input()
  public billings: BillingPagination;

  /** Invoice. */
  @Input()
  public invoice: Invoice;

  /** Rate type. */
  public RateType = RateType;

  /**
   * Get invoice title.
   * @param invoice Invoice.
   */
  public getInvoiceTitle(invoice: Invoice): string {
    const startMonth = JusLawDateUtils.obtainMonthName(invoice.periodStart);
    const endMonth = JusLawDateUtils.obtainMonthName(invoice.periodEnd);

    const periodStr = startMonth === endMonth
      ? startMonth
      : `${startMonth} - ${endMonth}`;

    return `${invoice.title} (${periodStr} Invoice)`;
  }
}

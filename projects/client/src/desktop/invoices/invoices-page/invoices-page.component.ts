import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { DateAdapter } from '@angular/material';
import { InvoicesTabDescription } from '@jl/common/core/models/invoice-tab-description';
import { InvoiceQuery } from '@jl/common/core/models/invoices-query';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { InvoiceService } from '@jl/common/core/services/invoice.service';
import { BaseInvoicesPage } from '@jl/common/desktop/base/invoices/invoices.base';
import { CustomDateAdapter } from '@jl/common/desktop/modules/matters/pages/matter-details-page/date-adapter';
import { DialogsService } from '@jl/common/shared/modules/dialogs/dialogs.service';

const TABS: InvoicesTabDescription[] = [
  { name: 'Unpaid', status: InvoiceQuery.STATUS_UNPAID },
  { name: 'Paid', status: InvoiceQuery.STATUS_PAID },
];

/**
 * Invoices page.
 */
@Component({
  selector: 'jlcl-invoices-page',
  templateUrl: './invoices-page.component.html',
  styleUrls: ['./invoices-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
  ],
})
export class InvoicesPageComponent extends BaseInvoicesPage {

  /**
   * @inheritdoc
   */
  public constructor(
    invoiceService: InvoiceService,
    curUserService: CurrentUserService,
    formBuilder: FormBuilder,
    dialogsService: DialogsService,
    cdr: ChangeDetectorRef,
  ) {
    super(invoiceService, formBuilder, dialogsService, cdr, curUserService, TABS);
  }
}

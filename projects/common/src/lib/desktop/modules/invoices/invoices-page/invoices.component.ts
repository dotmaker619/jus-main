import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { DateAdapter } from '@angular/material';
import { InvoiceStatus } from '@jl/common/core/models/invoice-status';
import { InvoicesTabDescription } from '@jl/common/core/models/invoice-tab-description';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { InvoiceService } from '@jl/common/core/services/invoice.service';
import { BaseInvoicesPage } from '@jl/common/desktop/base/invoices/invoices.base';
import { CustomDateAdapter } from '@jl/common/desktop/modules/matters/pages/matter-details-page/date-adapter';
import { DialogsService } from '@jl/common/shared';
import { EditInvoiceDialogComponent } from '@jl/common/shared/components/edit-invoice-dialog/edit-invoice-dialog.component';

const TABS: InvoicesTabDescription[] = [
  { name: 'Pending', status: { statuses: [InvoiceStatus.Pending] } },
  { name: 'Sent', status: { statuses: [InvoiceStatus.Sent] } },
];

/** Invoices page component. */
@Component({
  selector: 'jlc-invoices-page',
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
  ],
})
export class InvoicesComponent extends BaseInvoicesPage {

  /**
   * @inheritdoc
   * @param dialogsService Dialogs service.
   */
  public constructor(
    invoiceService: InvoiceService,
    curUserService: CurrentUserService,
    formBuilder: FormBuilder,
    cdr: ChangeDetectorRef,
    protected readonly dialogsService: DialogsService,
  ) {
    super(invoiceService, formBuilder, dialogsService, cdr, curUserService, TABS);
  }

  /**
   * Open dialog for creating an invoice.
   */
  public async onCreateInvoiceClicked(): Promise<void> {
    const invoiceCreated = await this.dialogsService.openDialog(EditInvoiceDialogComponent, {
      'title': 'Create an invoice',
    });

    if (invoiceCreated) {
      this.update$.next();
    }
  }
}

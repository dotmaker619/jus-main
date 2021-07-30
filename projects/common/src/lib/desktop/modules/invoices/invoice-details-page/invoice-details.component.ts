import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Link } from '@jl/common/core/models';
import { DialogOptions } from '@jl/common/core/models/dialog-options';
import { Invoice } from '@jl/common/core/models/invoice';
import { QuickbooksClient } from '@jl/common/core/models/quickbooks-client';
import { RateType } from '@jl/common/core/models/rate-type';
import { TimeBilling } from '@jl/common/core/models/time-billing';
import { TimeBillingService, BillingPagination } from '@jl/common/core/services/attorney/time-billing.service';
import { ExternalResourcesService } from '@jl/common/core/services/external-resources.service';
import { FileService } from '@jl/common/core/services/file.service';
import { InvoiceService } from '@jl/common/core/services/invoice.service';
import { QuickbooksService } from '@jl/common/core/services/quickbooks.service';
import { UrlsService } from '@jl/common/core/services/urls.service';
import { BaseInvoiceDetails } from '@jl/common/shared/base-components/invoices/invoice-details.base';
import { EditInvoiceDialogComponent } from '@jl/common/shared/components/edit-invoice-dialog/edit-invoice-dialog.component';
import { DialogsService } from '@jl/common/shared/modules/dialogs/dialogs.service';
import { LogTimeDialogOptions, LogTimeDialogComponent } from '@jl/common/shared/modules/dialogs/log-time-dialog/log-time-dialog.component';
import { Observable, combineLatest, of, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { SendInvoiceDialogComponent } from '../components/send-invoice-dialog/send-invoice-dialog.component';
import { PickClientDialogComponent } from '../dialogs/pick-client/pick-client-dialog.component';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

interface InvoiceAndBillings {
  /** Invoice */
  invoice: Invoice;
  /** Billings pagination */
  billings: BillingPagination;
}

/** Invoice details page component */
@Component({
  selector: 'jlc-invoice-details',
  templateUrl: './invoice-details.component.html',
  styleUrls: ['./invoice-details.component.css'],
})
export class InvoiceDetailsComponent extends BaseInvoiceDetails {
  /** Rate type */
  public readonly RateType = RateType;
  /** Invoice and billings as observable */
  public readonly invoiceAndBillings$: Observable<InvoiceAndBillings>;
  /** Breadcrumb links. */
  public readonly breadcrumbs$: Observable<Link<string[]>[]>;

  /**
   * @constructor
   * @param router Router.
   * @param urlsService Urls service.
   * @param invoiceService Invoice service.
   * @param activatedRoute Activated route.
   * @param quickbooksService Quickbooks service.
   * @param externalResourcesService External resources service.
   * @param dialogsService Dialogs service.
   * @param timeBillingService Time billings service.
   */
  public constructor(
    router: Router,
    urlsService: UrlsService,
    invoiceService: InvoiceService,
    activatedRoute: ActivatedRoute,
    quickbooksService: QuickbooksService,
    externalResourcesService: ExternalResourcesService,
    fileService: FileService,
    timeBillingService: TimeBillingService,
    private readonly dialogsService: DialogsService,
  ) {
    super(
      router,
      urlsService,
      activatedRoute,
      invoiceService,
      quickbooksService,
      externalResourcesService,
      timeBillingService,
      fileService,
    );

    this.invoiceAndBillings$ = combineLatest([this.invoice$, this.timeBillings$])
      .pipe(
        map(([invoice, billings]) => ({ invoice, billings })),
      );

    this.breadcrumbs$ = this.invoice$.pipe(
      map(({ id, title }) => [
        { label: 'Invoices', link: ['/invoices'] },
        { label: title, link: ['/invoices', id.toString()] },
      ]),
    );
  }

  /** Send invoice */
  public async sendInvoice(invoice: Invoice): Promise<void> {
    await this.dialogsService.openDialog(SendInvoiceDialogComponent, invoice);
  }

  /** Open dialog for time logging. */
  public async openLogTimeDialog(invoice: Invoice, billing?: TimeBilling): Promise<void> {
    const options: LogTimeDialogOptions = {
      matter: invoice.matter,
      invoiceId: invoice.id,
      timeBilling: billing,
    };

    await this.dialogsService.openDialog(LogTimeDialogComponent, options);

    this.update$.next();
  }

  /**
   * Open modal for editing a job.
   *
   * @param timeBilling Job.
   */
  public onTimeBillingClicked(invoice: Invoice, timeBilling: TimeBilling): void {
    this.openLogTimeDialog(invoice, timeBilling);
  }

  /**
   * Get invoice title.
   * @param invoice Invoice.
   */
  public getInvoiceTitle(invoice: Invoice): string {
    const dateOfCreation = new Date(invoice.periodStart);
    return `${MONTHS[dateOfCreation.getMonth()]} Invoice`;
  }

  /**
   * Open dialog for creating an invoice.
   */
  public async onEditInvoiceClicked(invoice: Invoice): Promise<void> {
    const invoiceEdited = await this.dialogsService.openDialog(EditInvoiceDialogComponent, {
      'title': 'Edit the invoice',
      'invoice': invoice,
    });

    if (invoiceEdited) {
      this.update$.next();
    }
  }

  /**
   * Handle 'click' of the 'Download invoice' button.
   */
  public onDownloadInvoiceClick(): void {
    this.downloadInvoice();
  }

  /** @inheritdoc */
  protected askForQuickbooksRedirect(): Observable<boolean> {
    return of(null).pipe(
      switchMap(() => this.dialogsService.showConfirmationDialog({
        cancelButtonText: 'Not now',
        confirmationButtonClass: 'primary',
        confirmationButtonText: 'OK',
        message: this.quickbooksRedirectDialogOptions.message,
        title: this.quickbooksRedirectDialogOptions.header,
      })),
    );
  }

  /** @inheritdoc */
  protected notifyUser({ message, header }: DialogOptions): Observable<void> {
    return of(null).pipe(
      switchMap(() => this.dialogsService.showInformationDialog({
        title: header,
        message,
      })),
    );
  }

  /** @inheritdoc */
  protected notifyUserSuccess({ message, header }: DialogOptions): Observable<void> {
    return of(null).pipe(
      switchMap(() => this.dialogsService.showSuccessDialog({
        title: header,
        message,
      })),
    );
  }

  /** @inheritdoc */
  protected pickQuickbooksClient(
    clients: QuickbooksClient[], preselectedClient?: QuickbooksClient,
  ): Observable<QuickbooksClient> {
    return of(null).pipe(
      switchMap(() => from(this.dialogsService.openDialog(PickClientDialogComponent, {
        clients,
        preselectedClient,
      }))),
    );
  }
}

import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, ActionSheetController } from '@ionic/angular';
import { DialogOptions } from '@jl/common/core/models/dialog-options';
import { QuickbooksClient } from '@jl/common/core/models/quickbooks-client';
import { TimeBilling } from '@jl/common/core/models/time-billing';
import { TimeBillingService } from '@jl/common/core/services/attorney/time-billing.service';
import { ExternalResourcesService } from '@jl/common/core/services/external-resources.service';
import { FileService } from '@jl/common/core/services/file.service';
import { InvoiceService } from '@jl/common/core/services/invoice.service';
import { QuickbooksService } from '@jl/common/core/services/quickbooks.service';
import { UrlsService } from '@jl/common/core/services/urls.service';
import { LogTimeModalMobileComponent } from '@jl/common/mobile/modals/log-time-modal-mobile/log-time-modal-mobile.component';
import { AlertService } from '@jl/common/mobile/services/alert.service';
import { BaseInvoiceDetails } from '@jl/common/shared/base-components/invoices/invoice-details.base';
import { Observable, of } from 'rxjs';
import { map, first, switchMap } from 'rxjs/operators';

import { EditInvoiceModalComponent } from '../modals/edit-invoice-modal/edit-invoice-modal.component';
import { PickClientModalComponent } from '../modals/pick-client-modal/pick-client-modal.component';
import { SendInvoiceModalComponent } from '../modals/send-invoice-modal/send-invoice-modal.component';

/** Invoice action enum. */
enum InvoiceAction {
  /** No action initiated. */
  NoAction = null,
  /** Edit invoice data. */
  Edit = 0,
  /** Export invoice to quickbooks. */
  QuickbooksExport,
}

/** Invoice details page. */
@Component({
  selector: 'jlc-invoice-details-page',
  templateUrl: './invoice-details-page.component.html',
  styleUrls: ['./invoice-details-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceDetailsPageComponent extends BaseInvoiceDetails {
  /** Page title stream. */
  public readonly pageTitle$: Observable<string>;

  private readonly actionMap: Record<InvoiceAction, () => void> = {
    [InvoiceAction.NoAction]: () => { },
    [InvoiceAction.Edit]: () => this.editInvoice(),
    [InvoiceAction.QuickbooksExport]: () => this.exportToQuickbooks(),
  };

  /**
   * @constructor
   *
   * @param router Router.
   * @param urlsService Urls service.
   * @param fileService File service.
   * @param activatedRoute Activated route.
   * @param invoicesService Invoices service.
   * @param quickbooksService Quickbooks service.
   * @param externalResourcesService External resources service.
   * @param alertService Alert service.
   * @param modalController Modal controller.
   * @param billingService Billing service.
   * @param actionSheetController Action sheet controller.
   */
  public constructor(
    router: Router,
    urlsService: UrlsService,
    fileService: FileService,
    activatedRoute: ActivatedRoute,
    invoicesService: InvoiceService,
    quickbooksService: QuickbooksService,
    externalResourcesService: ExternalResourcesService,
    billingService: TimeBillingService,
    private readonly alertService: AlertService,
    private readonly modalController: ModalController,
    private readonly actionSheetController: ActionSheetController,
  ) {
    super(
      router,
      urlsService,
      activatedRoute,
      invoicesService,
      quickbooksService,
      externalResourcesService,
      billingService,
      fileService,
    );
    this.pageTitle$ = this.initPageTitleStream();
  }

  /** Handle log time button click */
  public onLogTimeButtonClick(billing?: TimeBilling): void {
    this.invoice$.pipe(
      first(),
      switchMap(invoice => this.modalController.create({
        component: LogTimeModalMobileComponent,
        componentProps: {
          options: {
            invoiceId: invoice.id,
            matter: invoice.matter,
            timeBilling: billing,
          },
        },
      })),
      switchMap((modal) => modal.present() && modal.onDidDismiss()),
    ).subscribe(() => this.update$.next());
  }

    /**
   * Handle click on a job.
   * @param billing Job.
   */
  public async onBillingClick(billing: TimeBilling): Promise<void> {
    this.onLogTimeButtonClick(billing);
  }

  /** Handle 'sent to client' click. */
  public onSentToClientButtonClick(): void {
    this.invoice$.pipe(
      first(),
      switchMap(invoice => this.modalController.create({
        component: SendInvoiceModalComponent,
        componentProps: {
          invoiceId: invoice.id,
          clientEmail: invoice.client.email,
        },
      })),
      switchMap(modal => modal.present() && modal.onDidDismiss()),
    ).subscribe(() => this.update$.next());
  }

  /** Handle click on more button. */
  public async onMoreButtonClick(): Promise<void> {
    const action = await this.askUserForAction();
    this.actionMap[action]();
  }

  /**
   * Handle 'click' of the 'Download invoice' button.
   */
  public onDownloadInvoiceClick(): void {
    this.downloadInvoice();
  }

  /** @inheritdoc */
  protected askForQuickbooksRedirect(): Observable<boolean> {
    return this.alertService.showConfirmation({
      ...this.quickbooksRedirectDialogOptions,
      buttonText: 'OK',
      cancelButtonText: 'Not now',
    });
  }

  /** @inheritdoc */
  protected notifyUser({ message, header }: DialogOptions): Observable<void> {
    return of(null).pipe(
      switchMap(() => this.alertService.showNotificationAlert({
        message, header,
      })),
    );
  }

  /** @inheritdoc */
  protected notifyUserSuccess({ message, header }: DialogOptions): Observable<void> {
    return this.notifyUser({message, header});
  }

  /** @inheritdoc */
  protected pickQuickbooksClient(
    clients: QuickbooksClient[], preselectedClient?: QuickbooksClient,
  ): Observable<QuickbooksClient> {
    return of(null).pipe(
      switchMap(() => this.modalController.create({
        component: PickClientModalComponent,
        componentProps: {
          options: {
            clients, preselectedClient,
          },
        },
      })),
      switchMap(modal => modal.present() && modal.onDidDismiss()),
      map(result => result.data as QuickbooksClient | null),
    );
  }

  private editInvoice(): void {
    this.invoice$.pipe(
      first(),
      switchMap((invoice) => this.modalController.create({
        component: EditInvoiceModalComponent,
        componentProps: { invoice },
      })),
      switchMap(modal => modal.present() && modal.onDidDismiss()),
    ).subscribe(() => this.update$.next());
  }

  private askUserForAction(): Promise<InvoiceAction> {
    return new Promise(async (resolve) => {
      const isEditable = await this.isInvoiceEditable$.pipe(first()).toPromise();
      const buttons = [{
          text: 'Export to Quickbooks',
          handler: () => resolve(InvoiceAction.QuickbooksExport),
      }];
      if (isEditable) {
        buttons.unshift({
          text: 'Edit',
          handler: () => resolve(InvoiceAction.Edit),
        });
      }
      const sheet = await this.actionSheetController.create({
        buttons: [
          ...buttons,
          {
            text: 'Cancel',
            role: 'cancel',
          },
        ],
      });
      sheet.present();
      await sheet.onDidDismiss();
      resolve(InvoiceAction.NoAction);
    });
  }

  private initPageTitleStream(): Observable<string> {
    return this.invoice$.pipe(
      map(invoice => invoice.title),
    );
  }
}

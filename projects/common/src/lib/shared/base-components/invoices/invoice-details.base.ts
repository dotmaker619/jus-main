import { OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogOptions } from '@jl/common/core/models/dialog-options';
import { Invoice } from '@jl/common/core/models/invoice';
import { QuickbooksClient } from '@jl/common/core/models/quickbooks-client';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { BillingPagination, TimeBillingService } from '@jl/common/core/services/attorney/time-billing.service';
import { ExternalResourcesService } from '@jl/common/core/services/external-resources.service';
import { FileService } from '@jl/common/core/services/file.service';
import { InvoiceService } from '@jl/common/core/services/invoice.service';
import { QuickbooksService, QuickbooksError } from '@jl/common/core/services/quickbooks.service';
import { UrlsService } from '@jl/common/core/services/urls.service';
import { BehaviorSubject, Observable, combineLatest, of, Subject } from 'rxjs';
import { first, switchMap, filter, catchError, tap, take, map, startWith, shareReplay } from 'rxjs/operators';

const REDIRECT_DIALOG_OPTIONS: DialogOptions = {
  header: 'Quickbooks is not bound to JusLaw account',
  message: 'You want to proceed to account binding?',
};

const AUTH_FAILED_DIALOG_OPTIONS: DialogOptions = {
  header: 'Error Exporting Invoice',
  message: 'Please, give a permission to JusLaw in QuickBooks',
};

const AUTH_REDIRECT_SUCCESS_PARAM = 'quickbooks';
const AUTH_REDIRECT_ERROR_PARAM = 'quickbooksError';

/** Base class for invoice-details page. */
export abstract class BaseInvoiceDetails implements OnInit {

  /** Is app loading. */
  public readonly isLoading$ = new BehaviorSubject<boolean>(false);
  /** Invoice. */
  public readonly invoice$: Observable<Invoice>;

  /** Time billings with pagination */
  public readonly timeBillings$: Observable<BillingPagination>;

  /** Is invoice paid. */
  public readonly isInvoiceEditable$: Observable<boolean>;

  /** Emitted when need to update the data. */
  protected readonly update$ = new Subject<void>();
  /** Options for dialog redirecting to quickbooks authorization. */
  protected readonly quickbooksRedirectDialogOptions = REDIRECT_DIALOG_OPTIONS;
  /** Options for dialog when quickbooks auth is failed. */
  protected readonly quickbooksAuthFailedDialogOptions = AUTH_FAILED_DIALOG_OPTIONS;

  /**
   * @constructor
   *
   * @param router Router.
   * @param urlsService Urls service.
   * @param activatedRoute Activated route.
   * @param invoicesService Invoices service.
   * @param quickbooksService Quickbooks service.
   * @param externalResourcesService External resources service.
   * @param fileService File service.
   */
  public constructor(
    protected readonly router: Router,
    protected readonly urlsService: UrlsService,
    protected readonly activatedRoute: ActivatedRoute,
    protected readonly invoicesService: InvoiceService,
    protected readonly quickbooksService: QuickbooksService,
    protected readonly externalResourcesService: ExternalResourcesService,
    protected readonly billingService: TimeBillingService,
    private readonly fileService: FileService,
  ) {
    const id$ = this.activatedRoute.params.pipe(
      map(({ id }) => id),
      filter(id => id),
    );

    this.invoice$ = this.initInvoiceStream(id$);
    this.timeBillings$ = this.initTimeBillingStream(id$);
    this.isInvoiceEditable$ = this.invoice$.pipe(
      map(invoice => invoice.isEditable),
      startWith(true),
      shareReplay({bufferSize: 1, refCount: true}),
    );
  }

  /** @inheritdoc */
  public ngOnInit(): void {
    /**
     * Check whether we are redirected from quickbooks authorization.
     * This way we may be sure that we were trying to export the invoice,
     *  so repeat it.
     */
    const {
      [AUTH_REDIRECT_SUCCESS_PARAM]: shouldExport,
      [AUTH_REDIRECT_ERROR_PARAM]: shouldNotifyAboutError,
    } = this.activatedRoute.snapshot.queryParams;
    if (shouldExport) {
      this.exportToQuickbooks();
    } else if (shouldNotifyAboutError) {
      this.notifyUser(AUTH_FAILED_DIALOG_OPTIONS);
    }
  }

  /** Export to quickbooks. */
  public exportToQuickbooks(): void {
    const invoice$ = this.invoice$.pipe(
      first(),
    );

    this.isLoading$.next(true);

    const selectedClient$ = combineLatest([
      invoice$,
      this.quickbooksService.getAvailableClients(),
    ]).pipe(
      onMessageOrFailed(() => this.isLoading$.next(false)),
      switchMap(([invoice, clients]) =>
        this.pickQuickbooksClient(
          clients,
          // Trying to preselect the user by invoice client's email
          clients.find(c => invoice.client.email === c.email),
        ),
      ),
      first(),
      filter(client => client !== undefined),
    );

    const exportInvoice$ = combineLatest([
      invoice$,
      selectedClient$,
    ]).pipe(
      tap(() => this.isLoading$.next(true)),
      switchMap(([invoice, client]) =>
        this.quickbooksService.exportInvoice(invoice.id, client && client.id)),
    );

    exportInvoice$.pipe(
      onMessageOrFailed(() => this.isLoading$.next(false)),
      switchMap(() => this.notifyUserSuccess({
        header: 'Invoice Exported',
        message: null,
      })),
      catchError((error) => this.handleErrorExportingInvoice(error)),
    ).toPromise();
  }

  /**
   * Download current invoice statistics.
   */
  protected downloadInvoice(): void {
    this.invoice$.pipe(
      first(),
      switchMap((invoice) => combineLatest([
        of(invoice.downloadFileName),
        this.invoicesService.downloadInvoice(invoice.id),
      ])),
      switchMap(([filename, invoiceBlob]) => this.fileService.downloadFile(invoiceBlob, filename)),
      take(1),
    ).subscribe();
  }

  private handleErrorExportingInvoice(error: QuickbooksError | string): Observable<void> {
    // Using switch-case to be able to add other types of errors conveniently.
    switch (error) {
      case QuickbooksError.AuthorizationRequired:
        return this.tryAuthorizeToQuickbooks();
    }
    return this.notifyUser({
      header: 'Error Exporting Invoice',
      message: error,
    });
  }

  private tryAuthorizeToQuickbooks(): Observable<void> {
    const currentLocation = this.urlsService.getApplicationStateUrl(this.router.url);
    const successUrl = new URL(currentLocation);
    successUrl.searchParams.set(AUTH_REDIRECT_SUCCESS_PARAM, 'true');
    const errorUrl = new URL(currentLocation);
    errorUrl.searchParams.set(AUTH_REDIRECT_ERROR_PARAM, 'true');

    const urlToAuthorize$ = this.quickbooksService.getUrlToAuthorize(
      successUrl.toString(), errorUrl.toString(),
    );

    return this.askForQuickbooksRedirect().pipe(
      filter(shouldRedirect => shouldRedirect),
      tap(() => this.isLoading$.next(true)),
      switchMap(() => urlToAuthorize$),
      onMessageOrFailed(() => this.isLoading$.next(false)),
      switchMap(url => this.externalResourcesService.openExternalLink(url)),
    );
  }

  private initInvoiceStream(id$: Observable<number>): Observable<Invoice> {
    return combineLatest([
      id$,
      this.update$.pipe(startWith(null)),
    ]).pipe(
      switchMap(([id]) => this.invoicesService.getInvoiceById(id)),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
  }

  private initTimeBillingStream(id$: Observable<number>): Observable<BillingPagination> {
    return combineLatest([
      id$,
      this.update$.pipe(startWith(void 0)),
    ]).pipe(
      switchMap(([id]) => this.billingService.getAllTimeBillingsForInvoice(id)),
      shareReplay({refCount: true, bufferSize: 1}),
    );
  }

  /** Ask user for redirecting to quickbooks. */
  protected abstract askForQuickbooksRedirect(): Observable<boolean>;

  /** Notify user about error. */
  protected abstract notifyUser({ message, header }: DialogOptions): Observable<void>;
  /** Notify user about successful action. */
  protected abstract notifyUserSuccess({message, header}: DialogOptions): Observable<void>;

  /** Pick client from quickbooks. */
  protected abstract pickQuickbooksClient(
    clients: QuickbooksClient[],
    preselectedClient?: QuickbooksClient,
  ): Observable<QuickbooksClient | null>;
}

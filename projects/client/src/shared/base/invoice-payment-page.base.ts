import { ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DestroyableBase } from '@jl/common/core';
import { Invoice } from '@jl/common/core/models/invoice';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { BillingPagination, TimeBillingService } from '@jl/common/core/services/attorney/time-billing.service';
import { InvoiceService } from '@jl/common/core/services/invoice.service';
import { InvoicePaymentService } from '@jl/common/core/services/payment/invoice-payment.service';
import { PaymentMethodFormComponent } from '@jl/common/shared/components/payment-method-form/payment-method-form.component';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, first, tap, shareReplay, switchMap, catchError } from 'rxjs/operators';

/**
 * Available view states.
 */
enum PaymentViewState {
  /** Payment is not available */
  NotAvailable,
  /** Payment in progress */
  InProgress,
  /** Payment is finished */
  Finished,
}

/**
 * Base class for client invoice payment page.
 */
export abstract class BaseInvoicePaymentPage extends DestroyableBase {
  /** Invoice to pay for. */
  public readonly invoice$: Observable<Invoice>;
  /** List of jobs. */
  public readonly billings$: Observable<BillingPagination>;
  /** Loading controller. */
  public readonly isLoading$ = new BehaviorSubject(false);
  /** View state. */
  public readonly viewState$ = new BehaviorSubject(PaymentViewState.InProgress);
  /** States list. */
  public readonly PaymentViewState = PaymentViewState;
  /** Stripe card component. Provides stripe element to pay with. */
  @ViewChild(PaymentMethodFormComponent, { static: false })
  public stripeElementContainer: PaymentMethodFormComponent;

  /**
   * @constructor
   *
   * @param route Activated route
   * @param invoicePaymentService Payment service.
   * @param invoiceService Invoice service.
   * @param timeBillingService Time billing service.
   */
  public constructor(
    route: ActivatedRoute,
    private readonly invoicePaymentService: InvoicePaymentService,
    private readonly invoiceService: InvoiceService,
    private readonly timeBillingService: TimeBillingService,
  ) {
    super();
    const id$ = route.paramMap.pipe(
      first(),
      map(params => parseInt(params.get('id'), 10)),
    );

    this.invoice$ = this.initInvoiceStream(id$);
    this.billings$ = this.initTimeBillingStream(id$);
  }

  /**
   * On credit card submitted.
   */
  public onPaymentFormSubmitted(): void {
    if (this.isLoading$.value) {
      return;
    }

    this.isLoading$.next(true);
    combineLatest([
      this.invoice$,
      this.stripeElementContainer.createPaymentMethod(),
    ]).pipe(
      first(),
      switchMap(([invoice, cardToken]) =>
        this.invoicePaymentService.payForInvoice(invoice.id, cardToken)),
      onMessageOrFailed(() => this.isLoading$.next(false)),
      tap(() => this.viewState$.next(PaymentViewState.Finished)),
      catchError(({ message }: Error) => this.notify(message, 'Something is not right')),
    ).subscribe();
  }

  /**
   * Present message to a user.
   * @param message Message to present.
   * @param title Dialog title.
   */
  protected abstract notify(message: string, title: string): Promise<void>;

  private initInvoiceStream(id$: Observable<number>): Observable<Invoice> {
    return id$.pipe(
      switchMap(id => this.invoiceService.getInvoiceById(id)),
      tap((invoice) => !invoice.isPaymentAvailable && this.viewState$.next(PaymentViewState.NotAvailable)),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }

  private initTimeBillingStream(id$: Observable<number>): Observable<BillingPagination> {
    return id$.pipe(
      switchMap((id) => this.timeBillingService.getAllTimeBillingsForInvoice(id)),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }
}

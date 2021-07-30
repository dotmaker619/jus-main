import { ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { JusLawPayments } from '@jl/common/core/models/payments';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { AuthService } from '@jl/common/core/services/auth.service';
import { StaffPaymentService } from '@jl/common/core/services/payment/staff-payment.service';
import { PaymentMethodFormComponent } from '@jl/common/shared/components/payment-method-form/payment-method-form.component';
import { Observable, combineLatest, BehaviorSubject, throwError } from 'rxjs';
import { pluck, shareReplay, first, switchMap, take, catchError, switchMapTo } from 'rxjs/operators';

const SUCCESSFUL_PAYMENT_MESSAGE = 'Thank you! Now you can freely use all Paralegal functionality';
const SUCCESSFUL_PAYMENT_TITLE = 'One Time Payment Complete!';

/**
 * Base class for staff payment page.
 */
export abstract class StaffPaymentBase {
  /** Fee amount. */
  public readonly price$: Observable<string>;
  /** Emits true when payment in progress. */
  public readonly isLoading$ = new BehaviorSubject<boolean>(false);

  /** Stripe card component. Provides stripe element to pay with. */
  @ViewChild(PaymentMethodFormComponent, { static: true })
  public stripeElementContainer: PaymentMethodFormComponent;

  private readonly paymentInfo$: Observable<JusLawPayments.PaymentInfo>;

  /**
   * @constructor
   * @param staffPaymentService Staff payment service.
   * @param authService Auth service.
   * @param router Router.
   */
  public constructor(
    private readonly staffPaymentService: StaffPaymentService,
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {
    this.paymentInfo$ = this.staffPaymentService.startPaymentSession().pipe(
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
    this.price$ = this.paymentInfo$.pipe(pluck('amount'));
  }

  /**
   * Handle payment submission.
   */
  public onSubmit(): void {
    if (this.isLoading$.value) {
      return;
    }

    this.isLoading$.next(true);
    combineLatest([
      this.paymentInfo$,
      this.stripeElementContainer.createPaymentMethod(),
    ]).pipe(
      first(),
      switchMap(([paymentInfo, paymentMethodId]) =>
        this.staffPaymentService.finishPayment(
          paymentInfo, paymentMethodId,
        )),
      onMessageOrFailed(() => this.isLoading$.next(false)),
      switchMap(() => this.notifySuccessfulPayment(
        SUCCESSFUL_PAYMENT_MESSAGE,
        SUCCESSFUL_PAYMENT_TITLE,
      )),
      catchError((err: Error) => {
        this.notifyAboutError(err.message, 'Something is not right');
        return throwError(err);
      }),
      take(1),
    ).subscribe(() => this.router.navigateByUrl('/'));
  }

  /** Notify user payment is successful. */
  protected abstract notifySuccessfulPayment(message: string, title: string): Promise<void>;

  /** Notify user about unsuccessful payment procedure. */
  protected abstract notifyAboutError(message: string, title: string): Promise<void>;

  /** Logout and cancel payment. */
  public onLogoutClick(): void {
    this.paymentInfo$.pipe(
      first(),
      switchMap(payment =>
        this.staffPaymentService.cancelPayment(payment.id)),
      take(1),
      switchMapTo(this.authService.logout()),
      take(1),
    ).subscribe();
  }
}

import { HttpErrorResponse } from '@angular/common/http';
import { OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DestroyableBase } from '@jl/common/core';
import { StripeBankAccount } from '@jl/common/core/models/stripe-bank-account';
import { StripeCardAccount } from '@jl/common/core/models/stripe-card-account';
import { StripeAccountService, AccountErrors as sae } from '@jl/common/core/services/stripe-account.service';
import { UrlsService } from '@jl/common/core/services/urls.service';
import { Observable, BehaviorSubject, EMPTY, throwError, ReplaySubject } from 'rxjs';
import { take, startWith, switchMapTo, shareReplay, map, filter, switchMap, tap, catchError } from 'rxjs/operators';

/**
 * List of available states of the page.
 */
enum StripeAccountState {
  /** Account exists and it's received successfully. Display account info. */
  Exist,
  /** Account does not exists. Display 'Registration' button. */
  NotExist,
  /** Account exists but there is not info. Show message. */
  Pending,
  /** Request in progress. */
  Unknown,
}

const FAILED_REGISTRATION = {
  title: 'Registration failed',
  message: 'Registration failed. Please, try again later.',
};

const AUTH_REDIRECT_SUCCESS_PARAM = 'isSuccess';

const TEMPLATE_MESSAGES = {
  accountInProcessing: `It seems you've already created a stripe account but it's not synchronized with our servers.
    Please, update the page or check it again in a few minutes.`,
  noAccount: `You have no account added yet. Please set up your direct deposit to start receiving payments.
    Note: Your billing method will be managed through Stripe.`,
};

/**
 * Base class for Direct deposit page.
 */
export abstract class BaseDirectDepositPage extends DestroyableBase implements OnInit {

  /** Account info. */
  public readonly accountInfo$: Observable<StripeCardAccount | StripeBankAccount>;

  /** View's current state. */
  public readonly viewState$: Observable<StripeAccountState>;

  /** URL to open stripe dashboard to edit payment method. */
  public readonly editLink$: Observable<string>;

  /** URL to open stripe registration page. */
  public readonly registerLink$: Observable<string>;

  /** Stripe account state list. */
  public readonly accountState = StripeAccountState;

  /** Trigger to update account account info. */
  public readonly updateAccount$ = new ReplaySubject<void>(1);

  /** Template text. */
  public readonly templateMessages = TEMPLATE_MESSAGES;

  private readonly viewStateChange$ = new BehaviorSubject(StripeAccountState.Unknown);

  /**
   * @constructor
   *
   * @param route Activated route.
   * @param router Router.
   * @param urlsService URLs service.
   * @param stripeAccountService Stripe account service.
   */
  public constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly urlsService: UrlsService,
    private readonly stripeAccountService: StripeAccountService,
  ) {
    super();
    this.accountInfo$ = this.initAccountInfo$();
    this.viewState$ = this.accountInfo$.pipe(
      take(1),
      startWith(this.viewStateChange$.value),
      switchMapTo(this.viewStateChange$),
      shareReplay({refCount: true, bufferSize: 1}),
    );
    this.editLink$ = this.initEditLink$();
    this.registerLink$ = this.initRegisterLink$();
  }

  /** @inheritdoc */
  public ngOnInit(): void {
    this.route.queryParamMap.pipe(
      map((params) => params.get(AUTH_REDIRECT_SUCCESS_PARAM)),
      filter(isSuccess => isSuccess != null && isSuccess === 'false'),
      switchMap(() => this.notifyUserAboutFailedRegistration(FAILED_REGISTRATION.title, FAILED_REGISTRATION.message)),
      take(1),
    ).subscribe();
  }

  /**
   * Display message about failed registration.
   * @param header Notification header.
   * @param message Notification message.
   */
  public abstract notifyUserAboutFailedRegistration(header: string, message: string): Promise<void>;

  private initAccountInfo$(): Observable<StripeCardAccount | StripeBankAccount> {
    return this.updateAccount$.pipe(
      startWith(null),
      switchMap(() => this.stripeAccountService.getAccount()),
      tap(() => this.viewStateChange$.next(StripeAccountState.Exist)),
      catchError((err: HttpErrorResponse | Error) => {
        if (err instanceof sae.AccountError && err.code === sae.HandledErrors.MissingStripeAccount) {
          this.viewStateChange$.next(StripeAccountState.NotExist);
          return EMPTY;
        }
        if (err instanceof sae.AccountError && err.code === sae.HandledErrors.AccountIsNotReady) {
          this.viewStateChange$.next(StripeAccountState.Pending);
          return EMPTY;
        }
        return throwError(err);
      }),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }

  private initRegisterLink$(): Observable<string> {
    return this.viewState$.pipe(
      filter(val => val === StripeAccountState.NotExist),
      take(1),
      switchMap(() => {
        const currentLocation = this.urlsService.getApplicationStateUrl(this.router.url);
        const successUrl = new URL(currentLocation);
        successUrl.searchParams.set(AUTH_REDIRECT_SUCCESS_PARAM, 'true');
        const errorUrl = new URL(currentLocation);
        errorUrl.searchParams.set(AUTH_REDIRECT_SUCCESS_PARAM, 'false');
        return this.stripeAccountService.getUrlToRegister(successUrl.toString(), errorUrl.toString());
      }),
    );
  }

  private initEditLink$(): Observable<string> {
    return this.viewState$.pipe(
      // Edit link is available in case when stripe account exists or it's in processing.
      filter(val => val === StripeAccountState.Exist || val === StripeAccountState.Pending),
      take(1),
      switchMap(() => this.stripeAccountService.getUrlToEdit()),
    );
  }
}

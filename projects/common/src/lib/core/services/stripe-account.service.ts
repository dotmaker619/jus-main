import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, of, MonoTypeOperatorFunction } from 'rxjs';
import { map, catchError, retryWhen, delay, switchMap, concatMap, pluck } from 'rxjs/operators';

import { StripeDTOs } from '../dto/stripe-account-dto';
import { StripeBankAccount } from '../models/stripe-bank-account';
import { StripeCardAccount } from '../models/stripe-card-account';

import { AppConfigService } from './app-config.service';

interface StripeAuthResponse {
  /** Url to register. */
  url: string;
}

export namespace AccountErrors {
  const MISSING_STRIPE_ACCOUNT = 'Any stripe account is not bound to this profile.';
  const ACCOUNT_IS_NOT_CREATED_YET = 'Payment account is not created yet.';
  const ACCOUNT_EXISTS = 'You are already have stripe account bound this profile.';

  /**
   * List of errors which can be handled.
   */
  export enum HandledErrors {
    /** Stripe account does not exist. */
    MissingStripeAccount,
    /** Account is created but it's still not synchronized with our server. */
    AccountIsNotReady,
    /** Account already exists. */
    AccountExists,
  }

  /**
   * Error class to work with stripe account errors.
   */
  export class AccountError extends Error {

    /**
     * @constructor
     * @param code Error code.
     */
    public constructor(public readonly code: HandledErrors) {
      super(mapErrorToReadable(code));
      this.name = 'StripeAccountError';
    }
  }

  /**
   * Map error code to readable value.
   * @param err Handled error.
   */
  // tslint:disable-next-line: completed-docs
  function mapErrorToReadable(err: HandledErrors): string {
    switch (err) {
      case (HandledErrors.MissingStripeAccount):
        return MISSING_STRIPE_ACCOUNT;
      case (HandledErrors.AccountIsNotReady):
        return ACCOUNT_IS_NOT_CREATED_YET;
      case (HandledErrors.AccountExists):
        return ACCOUNT_EXISTS;
      default:
        return '';
    }
  }
}

const sae = AccountErrors;

/**
 * Service to work with stripe accounts.
 */
@Injectable({ providedIn: 'root' })
export class StripeAccountService {
  /** List of errors which can be handled. */
  public readonly handledErrors = AccountErrors.HandledErrors;

  private readonly accountUrl: string;
  private readonly authUrl: string;

  /**
   * @constructor
   * @param http HTTP client.
   * @param appConfig App config.
   */
  public constructor(
    appConfig: AppConfigService,
    private readonly http: HttpClient,
  ) {
    this.accountUrl = new URL('finance/deposits/profiles/current/', appConfig.apiUrl).toString();
    this.authUrl = new URL('finance/deposits/auth/url/', appConfig.apiUrl).toString();
  }

  /**
   * Get information of the current user stripe account.
   */
  public getAccount(): Observable<StripeCardAccount | StripeBankAccount> {
    return this.http.get<StripeDTOs.AccountDto>(this.accountUrl).pipe(
      map((accountDto) => this.mapStripeAccountDtoToCardOrBankAccount(accountDto)),
      catchError((err: HttpErrorResponse | Error) => {
        if (err instanceof HttpErrorResponse && err.status === 404) {
          return throwError(new sae.AccountError(sae.HandledErrors.MissingStripeAccount));
        }
        return throwError(err);
      }),
      this.retryAccountNotCreatedError(),
    );
  }

  private retryAccountNotCreatedError(): MonoTypeOperatorFunction<StripeCardAccount | StripeBankAccount> {
    const retryNumber = 3;
    const retryDelay = 2000;

    return retryWhen<StripeCardAccount | StripeBankAccount>(errors$ => errors$.pipe(
      switchMap((err) => {
        /*
         Check if it's an error we need, create a new stream with it.
         Otherwise, throw it outside.
        */
        if (
          err instanceof sae.AccountError &&
          err.code === sae.HandledErrors.AccountIsNotReady
        ) {
          return of(err);
        }
        return throwError(err);
      }),
      // Use concat map to keep the errors in order and make sure they aren't executed in parallel.
      concatMap((e, i) =>
        // Check the number of retries.
        i > retryNumber
          // Throw error if the number of attempts has ended
          ? throwError(e)
          // Create new stream with the current error and set delay to make a new request in a few seconds.
          : of(e).pipe(delay(retryDelay)),
      ),
    ));
  }

  private mapStripeAccountDtoToCardOrBankAccount(accountInfo: StripeDTOs.AccountDto): StripeBankAccount | StripeCardAccount {
    if (accountInfo.card_external_account) {
      return this.mapCardAccountDtoToCardAccount(
        accountInfo.card_external_account,
        accountInfo.is_verified,
      );
    }
    if (accountInfo.bank_external_account) {
      return this.mapBankAccountDtoToBankAccount(
        accountInfo.bank_external_account,
        accountInfo.is_verified,
      );
    }
    throw new sae.AccountError(sae.HandledErrors.AccountIsNotReady);
  }

  /**
   * Get url to register on Stripe
   * @param successUrl URL that's used to redirect in case successful registration.
   * @param errorUrl URL that's used to redirect in case unsuccessful registration.
   */
  public getUrlToRegister(successUrl: string, errorUrl: string): Observable<string> {
    const params = new HttpParams()
      .set('success_url', successUrl)
      .set('error_url', errorUrl);

    return this.http.get<StripeAuthResponse>(this.authUrl, { params }).pipe(
      pluck('url'),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 403) {
          return throwError(new sae.AccountError(
            sae.HandledErrors.AccountExists,
          ));
        }
      }),
    );
  }

  /**
   * Get url to open stripe dashboard to edit account.
   */
  public getUrlToEdit(): Observable<string> {
    const editAccountUrl = new URL('login-url/', this.accountUrl).toString();

    return this.http.get<StripeAuthResponse>(editAccountUrl).pipe(pluck('url'));
  }

  private mapCardAccountDtoToCardAccount(cardDto: StripeDTOs.CardAccountDto, isVerified: boolean): StripeCardAccount {
    return new StripeCardAccount(
      cardDto.id,
      cardDto.brand,
      cardDto.last4,
      cardDto.exp_month,
      cardDto.exp_year,
      isVerified,
    );
  }

  private mapBankAccountDtoToBankAccount(bankDto: StripeDTOs.BankAccountDto, isVerified: boolean): StripeBankAccount {
    return new StripeBankAccount(
      bankDto.id,
      bankDto.last4,
      bankDto.bank_name,
      isVerified,
    );
  }
}

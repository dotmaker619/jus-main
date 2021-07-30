import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PaymentProfileDto } from '@jl/common/core/dto/payment-profile-dto';
import { PaymentProfileMapper } from '@jl/common/core/mappers/payment-profile.mapper';
import { Observable, throwError, Subject } from 'rxjs';
import { map, shareReplay, catchError, tap, startWith, switchMap, mapTo, delay } from 'rxjs/operators';

import { PaginationDto } from '../dto';
import { PaymentPlanDto } from '../dto/payment-plan-dto';
import { SetupPaymentIntentTokenDto } from '../dto/setup-payment-intent-token-dto';
import { SubscriptionChangePreviewDto } from '../dto/subscription-change-preview-dto';
import { SubscriptionDto } from '../dto/subscription-dto';
import { SubscriptionSwitchDto } from '../dto/subscription-switch-dto';
import { ApiErrorMapper } from '../mappers/api-error.mapper';
import { PaymentPlanMapper } from '../mappers/payment-plan.mapper';
import { SetupPaymentIntentTokenMapper } from '../mappers/setup-payment-intent-token.mapper';
import { SubscriptionChangePreviewMapper } from '../mappers/subscription-change-preview.mapper';
import { SubscriptionMapper } from '../mappers/subscription.mapper';
import { SetupPaymentIntentToken } from '../models/setup-payment-intent-token';
import { SubscriptionChangePreview } from '../models/subscription-change-preview';
import { JusLawSubscriptions as jls } from '../models/subscriptions';

import { AppConfigService } from './app-config.service';

/**
 * To wait for update plan on backend after any action (buy, cancel etc.).
 * It's required because backend updates current profile only after Stripe WebHook triggers it.
 */
const WAIT_PLAN_UPDATE_DELAY = 6000;

/**
 * Service provides functionality to work with subscription logic (mostly for Attorneys for now).
 */
@Injectable({
  providedIn: 'root',
})
export class SubscriptionService {
  private readonly paymentPlansUrl = new URL('finance/plans/', this.appConfig.apiUrl).toString();
  private readonly intentTokenUrl = new URL('finance/subscribe/get-setup-intent/', this.appConfig.apiUrl).toString();
  private readonly currentProfileUrl = new URL('finance/profiles/current/', this.appConfig.apiUrl).toString();
  private readonly paymentPlanMapper = new PaymentPlanMapper();
  private readonly intentTokenMapper = new SetupPaymentIntentTokenMapper();
  private readonly paymentProfileMapper = new PaymentProfileMapper();
  private readonly subscriptionMapper = new SubscriptionMapper();
  private readonly subscriptionChangePreviewMapper = new SubscriptionChangePreviewMapper();
  private readonly apiErrorMapper = new ApiErrorMapper();
  private readonly paymentPlans$: Observable<jls.PaymentPlan[]>;
  private readonly paymentProfileChange$ = new Subject<void>();

  /**
   * @constructor
   * @param appConfig Application config service.
   * @param httpClient Angular HTTP client.
   */
  public constructor(
    private readonly appConfig: AppConfigService,
    private readonly httpClient: HttpClient,
  ) {
    this.paymentPlans$ = this.createPaymentPlansStream();
  }

  /**
   * Get current stripe profile
   */
  public getCurrentProfile(): Observable<jls.PaymentProfile> {
    return this.paymentProfileChange$
      .pipe(
        startWith(null),
        switchMap(() => this.httpClient.get<PaymentProfileDto>(this.currentProfileUrl)),
        map(dto => this.paymentProfileMapper.fromDto(dto)),
      );
  }

  /**
   * Update payment method for current user.
   * @param paymentMethodId Payment method ID.
   */
  public updatePaymentMethod(paymentMethodId: string): Observable<jls.PaymentProfile> {
    return this.updatePaymentProfile({ payment_method: paymentMethodId });
  }

  /**
   * Update payment plan for current user.
   * @param paymentPlan New payment plan.
   */
  public updatePaymentPlan(paymentPlan: jls.PaymentPlan): Observable<jls.Subscription> {
    const url = new URL('finance/subscription/change/', this.appConfig.apiUrl).toString();
    const body: SubscriptionSwitchDto = {
      plan: paymentPlan.id,
    };
    return this.httpClient.post<SubscriptionDto>(url, body)
      .pipe(
        delay(WAIT_PLAN_UPDATE_DELAY),
        tap(() => this.paymentProfileChange$.next()),
        this.apiErrorMapper.catchHttpErrorToApiErrorWithValidationSupport(this.subscriptionMapper),
        map(subscriptionDto => this.subscriptionMapper.fromDto(subscriptionDto)),
      );
  }

  private updatePaymentProfile(data: Partial<PaymentProfileDto>): Observable<jls.PaymentProfile> {
    return this.httpClient.patch<PaymentProfileDto>(this.currentProfileUrl, data)
      .pipe(
        delay(WAIT_PLAN_UPDATE_DELAY),
        tap(() => this.paymentProfileChange$.next()),
        this.apiErrorMapper.catchHttpErrorToApiErrorWithValidationSupport(this.paymentProfileMapper),
        map(profileDto => this.paymentProfileMapper.fromDto(profileDto)),
      );
  }

  /**
   * Get all available payment plans.
   */
  public getPaymentPlans(): Observable<jls.PaymentPlan[]> {
    return this.paymentPlans$;
  }

  /**
   * Get intent token for setup payment.
   */
  public getIntentToken(): Observable<SetupPaymentIntentToken> {
    return this.httpClient.get<SetupPaymentIntentTokenDto>(this.intentTokenUrl)
      .pipe(
        map(intentTokenDto => this.intentTokenMapper.fromDto(intentTokenDto)),
      );
  }

  /**
   * Cancel current user's subscription.
   */
  public cancelCurrentSubscription(): Observable<void> {
    const url = new URL('finance/subscription/cancel/', this.appConfig.apiUrl).toString();
    return this.httpClient.post(url, {})
      .pipe(
        catchError((httpError: HttpErrorResponse) => {
          const apiError = this.apiErrorMapper.fromDto(httpError);
          return throwError(apiError);
        }),
        delay(WAIT_PLAN_UPDATE_DELAY),
        tap(() => this.paymentProfileChange$.next()),
        mapTo(null),
      );
  }

  /**
   * Reactivate current subscription.
   */
  public reactivateCurrentSubscription(): Observable<void> {
    const url = new URL('finance/subscription/reactivate/', this.appConfig.apiUrl).toString();
    return this.httpClient.post(url, {})
      .pipe(
        catchError((httpError: HttpErrorResponse) => {
          const apiError = this.apiErrorMapper.fromDto(httpError);
          return throwError(apiError);
        }),
        delay(WAIT_PLAN_UPDATE_DELAY),
        tap(() => this.paymentProfileChange$.next()),
        mapTo(null),
      );
  }

  /**
   * Get preview of a plan change.
   * @param nextPlan Next plan.
   */
  public getChangePlanPreview(nextPlan: jls.PaymentPlan): Observable<SubscriptionChangePreview> {
    const url = new URL('finance/subscription/change/preview/', this.appConfig.apiUrl).toString();
    const body: SubscriptionSwitchDto = {
      plan: nextPlan.id,
    };
    return this.httpClient.post<SubscriptionChangePreviewDto>(url, body)
      .pipe(
        this.apiErrorMapper.catchHttpErrorToApiError(),
        map(changePreviewDto => this.subscriptionChangePreviewMapper.fromDto(changePreviewDto)),
      );
  }

  private createPaymentPlansStream(): Observable<jls.PaymentPlan[]> {
    return this.httpClient.get<PaginationDto<PaymentPlanDto>>(this.paymentPlansUrl)
      .pipe(
        map(({ results }) => {
          // Ignore pagination info because there is no reason to use pagination for plans.
          return results.map(planDto => this.paymentPlanMapper.fromDto(planDto));
        }),
        shareReplay({
          refCount: true,
          bufferSize: 1,
        }),
      );
  }
}

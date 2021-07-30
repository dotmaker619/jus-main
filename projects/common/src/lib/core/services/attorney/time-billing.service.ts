import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, } from 'rxjs';
import { map, catchError, mapTo, withLatestFrom, } from 'rxjs/operators';

import { PaginationDto } from '../../dto';
import { TimeBillingDto } from '../../dto/time-billing-dto';
import { ApiErrorMapper } from '../../mappers/api-error.mapper';
import { TimeBillingMapper } from '../../mappers/time-billing.mapper';
import { ApiValidationError } from '../../models/api-error';
import { Pagination } from '../../models/pagination';
import { TimeBilling } from '../../models/time-billing';
import { User } from '../../models/user';
import { AppConfigService } from '../app-config.service';
import { CurrentUserService } from '../current-user.service';

const DEFAULT_ORDERING = '-date';

/** Contains additional information about the set of billings. */
export interface BillingPagination extends Pagination<TimeBilling> {
  /** Total fees for the period. */
  totalFees: number;
  /** Total time worked. */
  totalTime: string;
}

/** Billing pagination Dto model */
interface BillingPaginationDto extends PaginationDto<TimeBillingDto> {
  /** Total fees for the period. */
  total_fees: number;
  /** Total time worked. */
  total_time: string;
}

/** Billing service. */
@Injectable({
  providedIn: 'root',
})
export class TimeBillingService {

  private readonly billingUrl = new URL('business/time-billing/', this.appConfig.apiUrl).toString();

  private readonly timeBillingMapper = new TimeBillingMapper();

  /**
   * @constructor
   * @param http Http client.
   * @param appConfig App config.
   * @param apiErrorMapper API error mapper.
   * @param userService User service.
   */
  public constructor(
    private readonly http: HttpClient,
    private readonly appConfig: AppConfigService,
    private readonly apiErrorMapper: ApiErrorMapper,
    private readonly userService: CurrentUserService,
  ) { }

  /** Get all time billings for invoice by id */
  public getAllTimeBillingsForInvoice(invoiceId: number): Observable<BillingPagination> {
    const params = new HttpParams({
      fromObject: {
        'invoice': invoiceId.toString(),
        ordering: DEFAULT_ORDERING,
      },
    });

    return this.http.get<BillingPaginationDto>(this.billingUrl, { params }).pipe(
      withLatestFrom(this.userService.currentUser$),
      map(([pagination, user]) => this.addEditableFieldToBilling(pagination, user)),
    );
  }

  /**
   * Get time billings by matter id.
   */
  public getTimeBillingsForMatter(matterId: number, fromDate: Date, toDate: Date, limit?: number): Observable<BillingPagination> {

    let params = new HttpParams().set('matter', matterId.toString());

    if (fromDate == null) {
      fromDate = new Date();
    }
    params = params.set('date__gte', this.timeBillingMapper.formatDate(fromDate));

    if (toDate == null) {
      toDate = new Date(
        fromDate.getFullYear(),
        fromDate.getMonth() + 1,
      );
    }
    params = params.set('date__lte', this.timeBillingMapper.formatDate(toDate));

    params = params.set('ordering', DEFAULT_ORDERING);

    if (limit != null) {
      params = params.set('limit', limit.toString());
    }

    return this.http.get<BillingPaginationDto>(this.billingUrl, { params }).pipe(
      withLatestFrom(this.userService.currentUser$),
      map(([pagination, user]) => this.addEditableFieldToBilling(pagination, user)),
    );
  }

  /**
   * Bill time for the matter.
   * @param timeBilling
   */
  public billTime(timeBilling: TimeBilling): Observable<void> {
    return this.http.post(this.billingUrl, this.timeBillingMapper.toDto(timeBilling)).pipe(
      mapTo(null),
      catchError((httpError: HttpErrorResponse) => {
        const apiError = this.apiErrorMapper.fromDtoWithValidationSupport(httpError, this.timeBillingMapper);
        return throwError(apiError);
      }),
    );
  }

  /**
   * Update time billing.
   * @param id Id of a time billing.
   * @param timeBilling Time billing fields we want to update.
   */
  public updateBilling(id: number, timeBilling: Partial<TimeBilling>): Observable<void> {
    const url = new URL(`${id}/`, this.billingUrl).toString();
    return this.http.patch(url, this.timeBillingMapper.toDto(timeBilling as TimeBilling)).pipe(
      mapTo(null),
      catchError((httpError: HttpErrorResponse) => {
        let apiError = this.apiErrorMapper.fromDtoWithValidationSupport(httpError, this.timeBillingMapper);
        /*
          Backend team said that if a response status is 403,
          it means that invoice with this billing log has been just paid.
         */
        if (apiError.status === '403') {
          apiError = new ApiValidationError<TimeBilling>({
            ...apiError,
            validationData: {
              description: 'Sorry, you cannot edit this log. Probably, the client has just paid the invoice with this billing log',
            },
          });
        }
        return throwError(apiError);
      }),
    );
  }

  /**
   * Delete time billing.
   * @param id Id of a time billing.
   */
  public removeBilling(id: number): Observable<void> {
    const url = new URL(`${id}/`, this.billingUrl).toString();
    return this.http.delete<void>(url);
  }

  /**
   * Transform time billing dto to create BilingPagination instance.
   *
   * @param pagination Billing pagination dto.
   * @param user User instance.
   *
   * @description
   * Check if a user is a person who made a bill and set isEditable to true. Otherwise - set false.
   * `user` param is optional because we don't always need to work with editable bills
   */
  private addEditableFieldToBilling(pagination: BillingPaginationDto, user?: User): BillingPagination {
    return {
      items: pagination.results.map(timeBilling => this.timeBillingMapper.fromDto({
        ...timeBilling,
        isEditableForCurrentUser: user && timeBilling.created_by === user.id,
      })),
      itemsCount: pagination.count,
      totalFees: pagination.total_fees,
      totalTime: pagination.total_time,
    } as BillingPagination;
  }
}

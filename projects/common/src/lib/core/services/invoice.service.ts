import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PaginationDto } from '@jl/common/core/dto';
import { InvoiceDto } from '@jl/common/core/dto/invoice-dto';
import { SendInvoiceDto } from '@jl/common/core/dto/send-invoice-dto';
import { InvoiceMapper } from '@jl/common/core/mappers/invoice.mapper';
import { SendInvoiceMapper } from '@jl/common/core/mappers/send-invoice.mapper';
import { Invoice } from '@jl/common/core/models/invoice';
import { SendInvoice } from '@jl/common/core/models/send-invoice';
import { MattersService } from '@jl/common/core/services/attorney/matters.service';
import { Observable, of, combineLatest, throwError, Subject } from 'rxjs';
import { map, first, switchMap, catchError, startWith, switchMapTo, tap } from 'rxjs/operators';

import { AppConfigService } from '../../core/services/app-config.service';
import { ApiErrorMapper } from '../mappers/api-error.mapper';
import { InvoiceQuery } from '../models/invoices-query';
import { JusLawDateUtils } from '../utils/date-utils';

type InvoiceQueryWithoutStatus = Omit<InvoiceQuery.InvoicesQuery, 'status'>;

/** General invoices service. Contains basic functionality to obtain invoices from API. */
@Injectable({ providedIn: 'root' })
export class InvoiceService {
  // Urls:
  private readonly baseUrl = this.appConfig.apiUrl;
  private readonly invoiceUrl = new URL('business/invoices/', this.baseUrl).toString();
  private readonly invoiceMapper: InvoiceMapper = new InvoiceMapper(this.invoiceUrl);
  private readonly apiErrorMapper = new ApiErrorMapper();
  private readonly invoicesUpdate$ = new Subject<void>();
  /**
   * @constructor
   * @param http Http client.
   * @param appConfig App config.
   * @param sendInvoiceMapper Mapper for invoice to send.
   * @param mattersService Matters service.
   */
  public constructor(
    private http: HttpClient,
    private appConfig: AppConfigService,
    private sendInvoiceMapper: SendInvoiceMapper,
    private mattersService: MattersService,
  ) { }

  /**
   * Get invoices.
   * @param filter Invoices query.
   */
  public getInvoices(filter?: InvoiceQuery.InvoicesQuery): Observable<Invoice[]> {
    return this.requestInvoices(filter).pipe(
      map(pagination => pagination.results),
      map(invoices => invoices.map(invoice => this.invoiceMapper.fromDto(invoice))),
    );
  }

  /**
   * Get total number of invoices.
   * @param filter Invoices query.
   */
  public getTotalNumberOfInvoices(filter?: InvoiceQuery.InvoicesQuery): Observable<number> {
    return this.requestInvoices({
      ...filter,
      limit: 1, // To avoid loading many objects, we only need a number of them
    }).pipe(
      map(pagination => pagination.count),
    );
  }

  /**
   * Create new invoice.
   * @param invoice Invoice.
   */
  public createInvoice(invoice: Invoice): Observable<Invoice> {
    return this.http.post<InvoiceDto>(
      this.invoiceUrl,
      this.invoiceMapper.toDto(invoice),
    ).pipe(
      map(invoiceDto => this.invoiceMapper.fromDto(invoiceDto)),
      catchError((httpError: HttpErrorResponse) => {
        const apiError = this.apiErrorMapper.fromDtoWithValidationSupport(httpError, this.invoiceMapper);
        return throwError(apiError);
      }),
      tap(() => this.invoicesUpdate$.next()),
    );
  }

  /**
   * Update existing invoice.
   * @param invoice Invoice.
   */
  public updateInvoice(invoice: Invoice): Observable<Invoice> {
    const url = new URL(`${invoice.id}/`, this.invoiceUrl);
    return this.http.patch<InvoiceDto>(url.toString(), this.invoiceMapper.toDto(invoice)).pipe(
      map(invoiceDto => this.invoiceMapper.fromDto(invoiceDto)),
      catchError((httpError: HttpErrorResponse) => {
        const apiError = this.apiErrorMapper.fromDtoWithValidationSupport(httpError, this.invoiceMapper);
        return throwError(apiError);
      }),
      tap(() => this.invoicesUpdate$.next()),
    );
  }

  /**
   * Send invoice.
   * @param invoiceId Invoice id.
   * @param sendInvoice Invoice to send.
   */
  public sendInvoice(invoiceId: number, sendInvoice: SendInvoice): Observable<SendInvoice> {
    const url = new URL(`${invoiceId}/send/`, this.invoiceUrl).toString();

    return this.http
      .post<SendInvoiceDto>(url, this.sendInvoiceMapper.toDto(sendInvoice))
      .pipe(
        map(dto => this.sendInvoiceMapper.fromDto(dto)),
        catchError((error: HttpErrorResponse) => {
          const apiError = this.apiErrorMapper.fromDtoWithValidationSupport(error, this.sendInvoiceMapper);
          return throwError(apiError);
        }),
        tap(() => this.invoicesUpdate$.next()),
      );
  }

  /**
   * Get invoice by id.
   * @param id Id of an invoice.
   */
  public getInvoiceById(id: number): Observable<Invoice> {
    return this.http
      .get<InvoiceDto>(new URL(`${id}/`, this.invoiceUrl).toString())
      .pipe(
        first(),
        map(dto => this.invoiceMapper.fromDto(dto)),
        switchMap(invoice => {
          return combineLatest(of(invoice), this.mattersService.getMatterById(invoice.matter.id));
        }),
        map(([invoice, matter]) => new Invoice({ ...invoice, matter })),
      );
  }

  /**
   * Download invoice as blob.
   * @param id Invoice id.
   */
  public downloadInvoice(id: number): Observable<Blob> {
    const url = new URL(`${id}/export/`, this.invoiceUrl).toString();
    return this.http.get(url, { responseType: 'blob' });
  }

  /** Get total number of paid invoices. */
  public getTotalNumberOfPaidInvoices(): Observable<number> {
    return this.getTotalNumberOfInvoices({
      statuses: InvoiceQuery.STATUS_PAID,
    });
  }

  /** Get total number of paid invoices. */
  public getTotalNumberOfUnpaidInvoices(): Observable<number> {
    return this.getTotalNumberOfInvoices({
      statuses: InvoiceQuery.STATUS_UNPAID,
    });
  }

  /** Get all the paid invoices. */
  public getPaidInvoices(filter?: InvoiceQueryWithoutStatus): Observable<Invoice[]> {
    return this.getInvoices({
      ...filter,
      statuses: InvoiceQuery.STATUS_PAID,
    });
  }

  /** Get all the sent invoices. */
  public getUnpaidInvoices(filter?: InvoiceQueryWithoutStatus): Observable<Invoice[]> {
    return this.getInvoices({
      ...filter,
      statuses: InvoiceQuery.STATUS_UNPAID,
    });
  }

  /**
   * Request invoices
   * @param filter Query parameters.
   */
  protected requestInvoices(filter?: InvoiceQuery.InvoicesQuery): Observable<PaginationDto<InvoiceDto>> {
    let params: HttpParams;

    // Set filtering options
    if (filter != null) {
      const paramsObj = {
        'limit': filter.limit && filter.limit.toString(),
        'status__in': filter.statuses && filter.statuses.statuses && filter.statuses.statuses.join(','),
        'payment_status__in': filter.statuses && filter.statuses.paymentStatuses && filter.statuses.paymentStatuses.join(','),
        'period_start': filter.fromDate && JusLawDateUtils.formatDate(filter.fromDate),
        'period_end': filter.toDate && JusLawDateUtils.formatDate(filter.toDate),
        'matter__client': filter.client && filter.client.join(','),
        'title__icontains': filter.query,
        'ordering': filter.order,
        'created_by': filter.createdBy && filter.createdBy.toString(),
      };
      params = this.createHttpParamsFromObject(paramsObj);
    }

    return this.invoicesUpdate$.pipe(
      startWith(null),
      switchMapTo(this.http.get<PaginationDto<InvoiceDto>>(this.invoiceUrl, { params })),
    );
  }

  /**
   * Angular HttpParams sends undefined properties as 'undefined' string.
   * It is not a desired behavior, so I decided to use this function to build
   *  HttpParams from object.
   */
  private createHttpParamsFromObject(paramsObj: { [key: string]: string | null }): HttpParams {
    let params = new HttpParams();
    Object.keys(paramsObj).forEach(key => {
      if (paramsObj[key] != null) {
        params = params.set(key, paramsObj[key]);
      }
    });
    return params;
  }
}

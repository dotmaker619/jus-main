import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, OperatorFunction } from 'rxjs';
import { mapTo, catchError, map } from 'rxjs/operators';

import { QuickbooksClient } from '../models/quickbooks-client';

import { AppConfigService } from './app-config.service';

interface QuickbooksAuthResponse {
  /** Url to authorize. */
  url: string;
}

/**
 * Quickbooks customer dto model.
 * Not supposed to be used in any other place.
 */
interface QuickbooksCustomerDto {
  /** Id. */
  id: number;
  /** Display name. */
  display_name: string;
  /** First name. */
  first_name: string;
  /** Last name. */
  last_name: string;
  /** Email. */
  email: string;
  /** Company. */
  company_name: string;
}

/** Types of errors  */
export enum QuickbooksError {
  /** User is not authorized to quickbooks. */
  AuthorizationRequired = 0,
}

/** Service to operate with Quickbooks. */
@Injectable({
  providedIn: 'root',
})
export class QuickbooksService {
  private readonly quickbooksExportUrl =
    new URL('accounting/export/invoice/', this.appConfig.apiUrl).toString();
  private readonly quickbooksAuthUrl =
    new URL('accounting/auth/url/', this.appConfig.apiUrl).toString();
  private readonly quickbooksClientsUrl =
    new URL('accounting/export/customers/', this.appConfig.apiUrl).toString();

  /**
   * @constructor
   * @param httpClient Http client.
   * @param appConfig App config.
   */
  public constructor(
    private readonly httpClient: HttpClient,
    private readonly appConfig: AppConfigService,
  ) { }

  /**
   * Export invoice info to quickbooks.
   * @param invoiceId Invoice id.
   * @param clientId Id of a quickbooks client.
   */
  public exportInvoice(invoiceId: number, clientId: number): Observable<void> {
    return this.httpClient.post(this.quickbooksExportUrl, {
      invoice: invoiceId,
      customer: clientId,
    }).pipe(
      mapTo(null),
      catchError(this.handleQuickbooksError),
    );
  }

  /**
   * Get external link to authorize in QuickBooks.
   * @param successUrl Url to navigate after successful authorization.
   * @param errorUrl Url to navigate after error.
   */
  public getUrlToAuthorize(successUrl: string, errorUrl: string): Observable<string> {
    const params = new HttpParams({
      fromObject: {
        success_url: successUrl,
        error_url: errorUrl,
      },
    });
    return this.httpClient.get<QuickbooksAuthResponse>(
      this.quickbooksAuthUrl, { params },
    ).pipe(
      map(({ url }) => url),
    );
  }

  /** Get clients for quickbooks service. */
  public getAvailableClients(): Observable<QuickbooksClient[]> {
    return this.httpClient.get<QuickbooksCustomerDto[]>(this.quickbooksClientsUrl).pipe(
      map(clients => clients.map(c => new QuickbooksClient({
        companyName: c.company_name,
        firstName: c.first_name,
        lastName: c.last_name,
        displayName: c.display_name,
        id: c.id,
        email: c.email,
      }))),
      catchError(this.handleQuickbooksError),
    );
  }

  private handleQuickbooksError(this: void, response: HttpErrorResponse): Observable<never> {
    if (response.error.detail === 'Not authenticated in QuickBooks') {
      return throwError(QuickbooksError.AuthorizationRequired);
    }

    const message = response.error.data &&
      response.error.data.invoice && response.error.data.invoice[0];

    // Error is not typed, so just throw a message
    return throwError(message || response.error.detail);
  }
}

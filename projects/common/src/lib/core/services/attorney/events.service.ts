import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { AttorneyEventDto } from '../../dto/attorney-event-dto';
import { PaginationDto } from '../../dto/pagination-dto';
import { ApiErrorMapper } from '../../mappers/api-error.mapper';
import { AttorneyEventMapper } from '../../mappers/attorney-event.mapper';
import { AttorneyEvent } from '../../models/attorney-event';
import { AppConfigService } from '../app-config.service';

/** Events request params. */
export interface EventsRequestParams {
  /** Attorney ID. */
  attorney?: number;
  /** Only upcoming events. */
  upcoming?: boolean;
  /** Which field to use when ordering the results. */
  ordering?: string;
}

/** Service for working with events API. */
@Injectable({
  providedIn: 'root',
})
export class EventsService {
  private readonly eventsUrl = new URL('promotion/events/', this.appConfig.apiUrl).toString();

  /**
   * @constructor
   * @param httpClient Http client service.
   * @param appConfig Application config service.
   * @param attorneyEventsMapper Attorney events mapper.
   * @param apiErrorMapper API error mapper.
   */
  public constructor(
    private httpClient: HttpClient,
    private appConfig: AppConfigService,
    private attorneyEventMapper: AttorneyEventMapper,
    private apiErrorMapper: ApiErrorMapper,
  ) {}

  /**
   * Get events.
   * @param order sort order
   */
  public getEvents(requestParams: EventsRequestParams = {}): Observable<AttorneyEvent[]> {
    let params = new HttpParams();

    if (requestParams.attorney) {
      params = params.set('attorney', requestParams.attorney.toString());
    }

    if (requestParams.upcoming) {
      params = params.set('upcoming', requestParams.upcoming.toString());
    }

    if (requestParams.ordering) {
      params = params.set('ordering', requestParams.ordering);
    }

    return this.httpClient.get<PaginationDto<AttorneyEventDto>>(this.eventsUrl, { params }).pipe(
      map(({results: attorneyEvents}) => attorneyEvents.map(attorneyEvent => this.attorneyEventMapper.fromDto(attorneyEvent))),
    );
  }

  /**
   * Get event.
   * @param id Event id
   */
  public getEvent(id: number | string): Observable<AttorneyEvent> {
    const url = new URL(`${id}/`, this.eventsUrl).toString();
    return this.httpClient.get<AttorneyEventDto>(url).pipe(
      map(attorneyEvent => this.attorneyEventMapper.fromDto(attorneyEvent)),
    );
  }

  /**
   * Save event.
   * Creates or updates an event depend on ID is specified or not.
   * @param event Event to save.
   */
  public saveEvent(event: AttorneyEvent): Observable<AttorneyEvent> {
    const eventDto = this.attorneyEventMapper.toDto(event);
    const request$ = event.id == null
      ? this.httpClient.post<AttorneyEventDto>(this.eventsUrl, eventDto)
      : this.httpClient.put<AttorneyEventDto>(new URL(`${event.id}/`, this.eventsUrl).toString(), eventDto);

    return request$
      .pipe(
        catchError((httpError: HttpErrorResponse) => {
          const apiError = this.apiErrorMapper.fromDtoWithValidationSupport(httpError, this.attorneyEventMapper);
          return throwError(apiError);
        }),
        map(createdEvent => this.attorneyEventMapper.fromDto(createdEvent)),
      );
  }

  /**
   * Delete event.
   * @param id event id
  */
  public deleteEvent(id: number): Observable<void> {
    const urlDelete = new URL(`${id}/`, this.eventsUrl).toString();

    return this.httpClient.delete<void>(urlDelete);
  }
}

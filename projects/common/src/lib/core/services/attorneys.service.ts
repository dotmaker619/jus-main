import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PaginationDto } from '@jl/common/core/dto';
import { AttorneyDto } from '@jl/common/core/dto/attorney-dto';
import { AttorneyMapper } from '@jl/common/core/mappers/attorney.mapper';
import { Attorney } from '@jl/common/core/models/attorney';
import { AttorneySearchInfo } from '@jl/common/core/models/attorney-search-info';
import { PlaceResult } from '@jl/common/core/services/location.service';
import { Observable } from 'rxjs';
import { map, first, withLatestFrom } from 'rxjs/operators';

import { Pagination } from '../models/pagination';

import { AppConfigService } from './app-config.service';
import { CurrentUserService } from './current-user.service';

interface ExtendedAttorneySearchInfo extends AttorneySearchInfo {
  /** Attorney's company state. */
  state?: string;
}

interface SearchParams {
  /** Search query. */
  query?: string;
  /** Page number. */
  page?: number;
  /** Specialty id. */
  specialty?: number;
}

/**
 * Attorney service.
 */
@Injectable({
  providedIn: 'root',
})
export class AttorneysService {
  private readonly baseUrl = this.appConfig.apiUrl;
  private readonly attorneysUrl = new URL('users/attorneys/', this.baseUrl).toString();

  /**
   * @constructor
   *
   * @param appConfig Application config.
   * @param httpClient Http client.
   * @param attorneyMapper Attorney mapper.
   * @param userService User service.
   */
  public constructor(
    private readonly appConfig: AppConfigService,
    private readonly httpClient: HttpClient,
    private readonly attorneyMapper: AttorneyMapper,
    private readonly userService: CurrentUserService,
  ) { }

  /**
   * Get featured attorneys as observable.
   *
   * @param place - if provided, sort featured attorneys by distance to location.
   */
  public getFeaturedAttorneys(place: PlaceResult): Observable<Attorney[]> {
    let params = new HttpParams().set('featured', 'true');

    if (place) {
      params = params
        .set('latitude', place.geometry.location.lat().toString())
        .set('longitude', place.geometry.location.lng().toString())
        .set('ordering', 'distance');
    }

    return this.getAttorneys(params);
  }

  /**
   * Get sponsored attorneys.
   *
   * @param place Used to sort sponsored attorneys by distance to location.
   */
  public getSponsoredAttorneys(place: PlaceResult): Observable<Attorney[]> {
    let params = new HttpParams().set('sponsored', 'true');

    if (place) {
      params = params
        .set('latitude', place.geometry.location.lat().toString())
        .set('longitude', place.geometry.location.lng().toString())
        .set('ordering', 'distance');
    }

    return this.getAttorneys(params);
  }

  /**
   * Return list of nearest attorneys.
   *
   * @param searchInfo Attorney search info.
   * @param state Firm location state.
   */
  public getNearestAttorneys({
    latitude, longitude, name, specialityId, state,
  }: ExtendedAttorneySearchInfo = {}): Observable<Attorney[]> {
    let params = new HttpParams();
    if (latitude != null && longitude != null) {
      params = params
        .set('latitude', latitude.toString())
        .set('longitude', longitude.toString())
        .set('ordering', '-featured, distance');
    } else {
      params = params
        .set('ordering', '-featured');
    }
    if (specialityId != null) {
      params = params.set(
        'user__specialities',
        specialityId.toString());
    }
    if (name != null) {
      params = params.set('search', name);
    }

    if (state != null) {
      params = params
        .set('firm_location_state', state);
    }

    return this.getAttorneys(params);
  }

  /**
   * Search attorneys
   * @param param0 Search params.
   */
  public searchForAttorney({
    page, query, specialty,
  }: SearchParams): Observable<Pagination<Attorney>> {
    const ITEMS_PER_PAGE = 10;
    const offset = ((page || 0) * ITEMS_PER_PAGE).toString();
    let params = new HttpParams({
      fromObject: {
        offset,
        limit: ITEMS_PER_PAGE.toString(),
      },
    });

    if (query != null) {
      params = params.set('search', query);
    }

    if (specialty != null) {
      params = params.set('user__specialities', specialty.toString());
    }

    return this.httpClient.get<PaginationDto<AttorneyDto>>(this.attorneysUrl, { params })
      .pipe(
        first(),
        withLatestFrom(this.userService.currentUser$),
        map(([pagination, currentUser]) => ({
          items: pagination.results.map(
            a => this.attorneyMapper.fromDto(a))
            .filter(a => a.id !== currentUser.id), // We don't want to search for current attorney
          itemsCount: pagination.count,
          pagesCount: Math.ceil(pagination.count / ITEMS_PER_PAGE),
          page,
        }) as Pagination<Attorney>),
      );
  }

  private getAttorneys(params?: HttpParams): Observable<Attorney[]> {
    const options = params ? { params } : null;

    return this.httpClient.get<PaginationDto<AttorneyDto>>(this.attorneysUrl, options)
      .pipe(
        first(),
        map(({ results }) =>
          results.map(dto => this.attorneyMapper.fromDto(dto)),
        ),
      );
  }

    /**
   * Follow attorney.
   *
   * @param id Attorney's ID.
   */
  public followAttorney(id: number | string): Observable<void> {
    const url = new URL(`${id}/follow/`, this.attorneysUrl).toString();
    return this.httpClient.post<void>(url, null);
  }

  /**
   * Unfollow attorney.
   *
   * @param id Attorney's ID.
   */
  public unfollowAttorney(id: number | string): Observable<void> {
    const url = new URL(`${id}/unfollow/`, this.attorneysUrl).toString();
    return this.httpClient.post<void>(url, null);
  }
}

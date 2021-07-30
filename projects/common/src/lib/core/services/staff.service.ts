import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PaginationDto } from '../dto';
import { StaffDto } from '../dto/staff-dto';
import { StaffMapper } from '../mappers/staff.mapper';
import { BaseApiSearchParams } from '../models/base-api-search-params';
import { Pagination } from '../models/pagination';
import { Staff } from '../models/staff';

import { AppConfigService } from './app-config.service';

/** Number of staff records for the get request. */
const STAFF_PER_PAGE = 20;

/**
 * Search params for staff GET request
 */
// tslint:disable-next-line: no-empty-interface
interface StaffSearchParams extends BaseApiSearchParams { }

/**
 * Staff service.
 */
@Injectable({ providedIn: 'root' })
export class StaffService {
  private readonly staffUrl: string;

  /**
   * @constructor
   * @param appConfig App configuration service.
   * @param http Http client.
   * @param staffMapper Staff mapper.
   */
  public constructor(
    appConfig: AppConfigService,
    private readonly http: HttpClient,
    private readonly staffMapper: StaffMapper,
  ) {
    this.staffUrl = new URL('users/support/', appConfig.apiUrl).toString();
  }

  /**
   * Get staff users.
   */
  public getStaff(searchParams: StaffSearchParams): Observable<Pagination<Staff>> {
    let params = new HttpParams()
      .set('limit', STAFF_PER_PAGE.toString())
      .set('offset', ((searchParams.page || 0) * STAFF_PER_PAGE).toString());

    if (searchParams.search != null) {
      params = params.set('search', searchParams.search);
    }

    if (searchParams.ordering != null) {
      params = params.set('ordering', searchParams.ordering);
    }

    return this.http.get<PaginationDto<StaffDto>>(this.staffUrl, { params }).pipe(
      map(pagination => ({
        items: pagination.results.map(this.staffMapper.fromDto),
        itemsCount: pagination.count,
        pagesCount: Math.ceil(pagination.count / STAFF_PER_PAGE),
        page: searchParams.page,
      } as Pagination<Staff>),
      ),
    );
  }
}

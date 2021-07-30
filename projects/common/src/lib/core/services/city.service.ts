import {HttpClient, HttpParams} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {PaginationDto} from '@jl/common/core/dto';
import {CityMapper} from '@jl/common/core/mappers/city.mapper';
import {City} from '@jl/common/core/models/city';
import { AppConfigService } from '@jl/common/core/services/app-config.service';
import {Observable} from 'rxjs';
import {map, share} from 'rxjs/operators';

/** City service. */
@Injectable({
  providedIn: 'root',
})
export class CityService {

  private readonly citiesUrl = new URL('locations/cities/', this.appConfig.apiUrl).toString();

  constructor(
    private http: HttpClient,
    private cityMapper: CityMapper,
    private appConfig: AppConfigService,
  ) { }

  /** Get cities. */
  public getCities(filter?: string): Observable<City[]> {
    let params = new HttpParams();

    if (filter) {
      params = params.set('search', filter);
    }

    return this.http.get<PaginationDto<City>>(this.citiesUrl, {params})
      .pipe(
        map(pagination => pagination.results),
        map(results => results.map(city => this.cityMapper.fromDto(city))),
        share(),
      );
  }
}

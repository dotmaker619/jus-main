import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PaginationDto } from '@jl/common/core/dto';
import { CountryDto } from '@jl/common/core/dto/country-dto';
import { CountryMapper } from '@jl/common/core/mappers/country.mapper';
import { Country } from '@jl/common/core/models/country';
import { AppConfigService } from '@jl/common/core/services/app-config.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/** Countries service. */
@Injectable({
  providedIn: 'root',
})
export class CountriesService {

  private readonly countriesUrl = new URL('locations/countries/', this.appConfig.apiUrl).toString();

  private readonly countryMapper = new CountryMapper();

  /**
   * @constructor
   * @param http
   * @param appConfig
   */
  public constructor(
    private http: HttpClient,
    private appConfig: AppConfigService,
  ) {}

  /**
   * Get countries.
   */
  public getCountries(): Observable<Country[]> {
    return this.http.get<PaginationDto<CountryDto>>(this.countriesUrl).pipe(
      map(pagination => pagination.results),
      map(results => results.map(country => this.countryMapper.fromDto(country))),
    );
  }
}

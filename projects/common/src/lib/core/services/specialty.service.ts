import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PaginationDto } from '@jl/common/core/dto';
import { SpecialtyDto } from '@jl/common/core/dto/specialty-dto';
import { SpecialtyMapper } from '@jl/common/core/mappers/specialty.mapper';
import { Specialty } from '@jl/common/core/models/specialty';
import { AppConfigService } from '@jl/common/core/services/app-config.service';
import { Observable } from 'rxjs';
import { map, share } from 'rxjs/operators';

/**
 * Specialties service.
 */
@Injectable({
  providedIn: 'root',
})
export class SpecialtyService {

  private readonly specialtyUrl = new URL('users/specialities/', this.appConfig.apiUrl).toString();

  /**
   * @constructor
   *
   * @param http Http client.
   * @param specialtyMapper Specialty mapper.
   * @param appConfig Application config service.
   */
  public constructor(
    private http: HttpClient,
    private specialtyMapper: SpecialtyMapper,
    private appConfig: AppConfigService,
  ) { }

  /**
   * Get specialties.
   */
  public getSpecialties(): Observable<Specialty[]> {
    const params = new HttpParams().set('ordering', 'title');
    return this.http.get<PaginationDto<SpecialtyDto>>(this.specialtyUrl, { params })
      .pipe(
        map(({ results: specialties }) => specialties.map(
          specialty => this.specialtyMapper.fromDto(specialty),
        )),
        share(),
      );
  }

  /**
   * Get specialty by id.
   * @param id Id.
   */
  public getSpecialtyById(id: number): Observable<Specialty> {
    const url = new URL(id.toString(), this.specialtyUrl).toString();
    return this.http.get<SpecialtyDto>(url)
      .pipe(
        map((specialty) => this.specialtyMapper.fromDto(specialty)),
      );
  }
}

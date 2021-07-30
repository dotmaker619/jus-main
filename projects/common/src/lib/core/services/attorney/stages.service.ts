import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PaginationDto } from '@jl/common/core/dto';
import { StageDto } from '@jl/common/core/dto/stage-dto';
import { StageMapper } from '@jl/common/core/mappers/stage.mapper';
import { Stage } from '@jl/common/core/models/stage';
import { AppConfigService } from '@jl/common/core/services/app-config.service';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ApiErrorMapper } from '../../mappers/api-error.mapper';
import { DefaultRequestParams } from '../../models/default-request-params';

interface StageParams extends DefaultRequestParams {
  /** Matter id. */
  matter?: number;
}

/** Service for working with stages API. */
@Injectable({
  providedIn: 'root',
})
export class StagesService {
  private readonly stagesUrl = new URL('business/stages/', this.appConfig.apiUrl).toString();

  /**
   * @constructor
   * @param http
   * @param stageMapper
   */
  public constructor(
    private http: HttpClient,
    private appConfig: AppConfigService,
    private stageMapper: StageMapper,
    private apiErrorMapper: ApiErrorMapper,
  ) {}

  /**
   * Get stages.
   * @param order sort order
   */
  public getStages(reqParams?: StageParams): Observable<Stage[]> {
    let params = new HttpParams();
    for (const key in reqParams) {
      if (key in reqParams) {
        params = params.append(key, reqParams[key]);
      }
    }

    return this.http.get<PaginationDto<StageDto>>(this.stagesUrl, { params }).pipe(
      catchError((err) => {
        return throwError(err);
      }),
      map((pagination) => pagination.results),
      map((stages) => stages.map(stage => this.stageMapper.fromDto(stage))),
    );
  }

  /**
   * Create new stage.
   * @param stage
   */
  public createStage(stage: Stage): Observable<Stage> {
    return this.http.post<StageDto>(this.stagesUrl, this.stageMapper.toDto(stage)).pipe(
      map(createdStage => this.stageMapper.fromDto(createdStage)),
    );
  }

  /**
   * Update stage.
   * @param stage
   */
  public updateStage(stage: Stage): Observable<Stage> {
    const url = new URL(`${stage.id}/`, this.stagesUrl).toString();
    return this.http.put<Stage>(url, this.stageMapper.toDto(stage)).pipe(
      map(updatedStage => this.stageMapper.fromDto(updatedStage)),
    );
  }

  /**
   * Delete stage.
   * @param id stage id
  */
  public deleteStage(id: number): Observable<void> {
    const urlDelete = new URL(`${id}/`, this.stagesUrl).toString();

    return this.http.delete<void>(urlDelete).pipe(
      catchError((httpError: HttpErrorResponse) => {
        const apiError = this.apiErrorMapper.fromDto(httpError);
        return throwError(apiError);
      }),
    );
  }
}

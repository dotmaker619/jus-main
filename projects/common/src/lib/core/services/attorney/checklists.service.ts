import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PaginationDto } from '@jl/common/core/dto';
import { ChecklistDto } from '@jl/common/core/dto/checklist-dto';
import { ChecklistMapper } from '@jl/common/core/mappers/checklist.mapper';
import { ChecklistOption } from '@jl/common/core/models/checklist';
import { AppConfigService } from '@jl/common/core/services/app-config.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { DefaultRequestParams } from '../../models/default-request-params';

interface MatterSpecificParams extends DefaultRequestParams {
  /** Matter id. */
  matter?: number;
}

/** Service for working with checklist API. */
@Injectable({
  providedIn: 'root',
})
export class ChecklistsService {
  private readonly checklistUrl = new URL('business/checklist/', this.appConfig.apiUrl).toString();

  /** @constructor */
  public constructor(
    private http: HttpClient,
    private appConfig: AppConfigService,
    private checklistMapper: ChecklistMapper,
  ) { }

  /**
   * Get checklists.
   */
  public getChecklist(reqParams?: MatterSpecificParams): Observable<ChecklistOption[]> {
    let params = new HttpParams();
    for (const key in reqParams) {
      if (key in reqParams) {
        params = params.append(key, reqParams[key]);
      }
    }

    return this.http.get<PaginationDto<ChecklistDto>>(this.checklistUrl, { params })
      .pipe(
        map(({ results: checklists }) =>
          checklists.map(checklist =>
            this.checklistMapper.fromDto(checklist),
          ),
        ),
      );
  }

  /**
   * Create new checklist.
   * @param checklist
   */
  public createChecklist(checklist: ChecklistOption): Observable<ChecklistOption> {
    return this.http.post<ChecklistDto>(
      this.checklistUrl,
      this.checklistMapper.toDto(checklist),
    )
      .pipe(
        map(created =>
          this.checklistMapper.fromDto(created),
        ),
      );
  }

  /**
   * Update checklist.
   * @param checklist
   */
  public updateChecklist(checklist: ChecklistOption): Observable<ChecklistOption> {
    return this.http.put<ChecklistDto>(
      new URL(`${checklist.id}/`, this.checklistUrl).toString(),
      this.checklistMapper.toDto(checklist),
    )
      .pipe(
        map(updated => this.checklistMapper.fromDto(updated)),
      );
  }

  /**
   * Delete checklist.
   * @param id
   */
  public deleteChecklist(id: number): Observable<void> {
    return this.http.delete<void>(new URL(`${id}/`, this.checklistUrl).toString());
  }
}

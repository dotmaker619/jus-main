import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PaginationDto } from '@jl/common/core/dto';
import { ActivityDto } from '@jl/common/core/dto/activity-dto';
import { ActivityMapper } from '@jl/common/core/mappers/activity.mapper';
import { Activity } from '@jl/common/core/models/activity';
import { Matter } from '@jl/common/core/models/matter';
import { Observable,  } from 'rxjs';
import { map,  } from 'rxjs/operators';

import { AppConfigService } from '../app-config.service';

/** ActivitiesService. */
@Injectable({
  providedIn: 'root',
})
export class ActivitiesService {

  private readonly activitiesUrl = new URL('business/activities/', this.appConfig.apiUrl).toString();

  /** @constructor */
  public constructor(
    private http: HttpClient,
    private activityMapper: ActivityMapper,
    private appConfig: AppConfigService,
  ) {}

  /**
   * getActivities
   * @param matter
   */
  public getActivities(matter?: Matter): Observable<Activity[]> {
    let params = new HttpParams().set('ordering', '-created');

    if (matter) {
      params = params.set('matter', matter.id.toString());
    }

    return this.http.get<PaginationDto<ActivityDto>>(this.activitiesUrl, {params}).pipe(
      map((pagination) => pagination.results),
      map((results) => results.map((activity) => this.activityMapper.fromDto(activity))),
    );

  }
}

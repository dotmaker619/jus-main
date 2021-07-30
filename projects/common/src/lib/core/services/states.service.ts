import {HttpClient} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {PaginationDto} from '@jl/common/core/dto';
import {StateDto} from '@jl/common/core/dto/state-dto';
import {StateMapper} from '@jl/common/core/mappers/state.mapper';
import {State} from '@jl/common/core/models/state';
import { AppConfigService } from '@jl/common/core/services/app-config.service';
import {Observable} from 'rxjs';
import {map, share} from 'rxjs/operators';

/** States service. */
@Injectable({
  providedIn: 'root',
})
export class StatesService {

  private readonly statesUrl = new URL('locations/states/', this.appConfig.apiUrl).toString();

  /** @constructor */
  public constructor(private http: HttpClient, private stateMapper: StateMapper, private appConfig: AppConfigService) { }

  /** Get states. */
  public getStates(): Observable<State[]> {
    return this.http
      .get<PaginationDto<StateDto>>(this.statesUrl)
      .pipe(
        map(pagination => pagination.results),
        map(results => results.map(state =>
          this.stateMapper.fromDto(state)),
        ),
        share(),
      );
  }
}

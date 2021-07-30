import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, first } from 'rxjs/operators';

import { PaginationDto } from '../../dto';
import { MatterTopicDto } from '../../dto/matter-topic-dto';
import { MatterTopicMapper } from '../../mappers/matter-topic.mapper';
import { MatterTopic } from '../../models/matter-topic';
import { AppConfigService } from '../app-config.service';

/** Matter topic service. */
@Injectable({ providedIn: 'root' })
export class MatterTopicService {
  private readonly baseUrl = this.appConfig.apiUrl;
  private readonly matterTopicUrl = new URL('business/matter-topic/', this.baseUrl).toString();

  /** @constructor */
  public constructor(
    private http: HttpClient,
    private appConfig: AppConfigService,
    private matterTopicMapper: MatterTopicMapper,
  ) {}

  /** Get matter topic by id */
  public getMatterTopicById(id: number): Observable<MatterTopic> {
    const url = new URL(`${id}/`, this.matterTopicUrl).toString();

    return this.http.get<MatterTopicDto>(url)
      .pipe(
        first(),
        map(dto => this.matterTopicMapper.fromDto(dto)),
      );
  }

  /** Get matter topics. */
  public getMatterTopics(matterId: number): Observable<MatterTopic[]> {
    const params = new HttpParams()
      .set('matter', matterId.toString())
      .set('ordering', '-modified');

    return this.http.get<PaginationDto<MatterTopicDto>>(this.matterTopicUrl, { params })
      .pipe(
        first(),
        map(({ results }) =>
          results.map(dto => this.matterTopicMapper.fromDto(dto)),
        ),
      );
  }

  /** Create matter topic. */
  public createMatterTopic(matterId: number, title: string): Observable<MatterTopic> {
    return this.http.post<MatterTopicDto>(this.matterTopicUrl, { matter: matterId, title })
      .pipe(
        first(),
        map(dto => this.matterTopicMapper.fromDto(dto)),
      );
  }
}

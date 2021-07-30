import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PaginationDto, TopicDto } from '@jl/common/core/dto';
import { FollowDto } from '@jl/common/core/dto/follow-dto';
import { ApiErrorMapper } from '@jl/common/core/mappers/api-error.mapper';
import { FollowMapper } from '@jl/common/core/mappers/follow.mapper';
import { TopicMapper } from '@jl/common/core/mappers/topic.mapper';
import { Topic } from '@jl/common/core/models';
import { Follow } from '@jl/common/core/models/follow';
import { Pagination } from '@jl/common/core/models/pagination';
import { AppConfigService } from '@jl/common/core/services/app-config.service';
import { Observable, throwError, ReplaySubject } from 'rxjs';
import { catchError, map, switchMap, shareReplay } from 'rxjs/operators';

import { DefaultRequestParams } from '../models/default-request-params';

/** Topics service. */
@Injectable({
  providedIn: 'root',
})
export class TopicsService {

  /**
   * @constructor
   * @param http
   * @param topicMapper
   * @param followMapper
   * @param appConfig
   * @param apiErrorMapper
   */
  public constructor(
    private http: HttpClient,
    private topicMapper: TopicMapper,
    private followMapper: FollowMapper,
    private appConfig: AppConfigService,
    private apiErrorMapper: ApiErrorMapper,
  ) { }

  /** Default set of parameters. */
  public get defaultParams(): HttpParams {
    return new HttpParams()
      .set('limit', this.TOPICS_PER_PAGE.toString())
      .set('ordering', this.ORDERING_FIELD);
  }
  private readonly baseUrl = this.appConfig.apiUrl;
  private readonly topicsUrl = new URL('forum/topics/', this.baseUrl).toString();
  private readonly followedTopicsUrl = new URL('forum/followed/', this.baseUrl).toString();
  private readonly opportunitiesUrl = new URL('opportunities/', this.topicsUrl).toString();

  private readonly TOPICS_PER_PAGE = 15;
  private readonly ORDERING_FIELD = 'created';

  /** Subject emitting when new opportunities requested. */
  private opportunitiesRequestedWithParams$ = new ReplaySubject<DefaultRequestParams>(1);

  /** Cached opportunities. */
  private opportunitiesValue$ = this.opportunitiesRequestedWithParams$.pipe(
    switchMap((params) => this.getOpportunitiesFromApi(params)),
    shareReplay({
      refCount: true,
      bufferSize: 1,
    }),
  );

  /** Get topics by category id. */
  public getTopicsByCategoryId(
    page: number = 0,
    categoryId?: number,
  ): Observable<Pagination<Topic>> {
    let params = this.defaultParams;

    params = params.set('ordering', '-last_post__created');

    if (categoryId) {
      params = params.set('category', categoryId.toString());
    }
    if (page && page !== 0) {
      params = params.set('offset', (this.TOPICS_PER_PAGE * page).toString());
    }

    return this.http.get<PaginationDto<TopicDto>>(this.topicsUrl, { params }).pipe(
      map(this.mapTopicPagination),
    );
  }

  /**
   * Get topic by id.
   * @param id Id of topic.
   */
  public getTopicById(id: number): Observable<Topic> {
    const url = new URL(`${id}/`, this.topicsUrl);

    return this.http
      .get<TopicDto>(url.toString())
      .pipe(map(topic => this.topicMapper.fromDto(topic)));
  }

  /**
   * Search topics.
   * @param query Search query.
   * @param page Page number.
   */
  public searchTopics(
    query: string,
    page: number = 0,
  ): Observable<Pagination<Topic>> {
    let params = this.defaultParams
      .set('offset', (this.TOPICS_PER_PAGE * page).toString());

    if (query) {
      params = params.set('search', query);
    }

    return this.http.get<PaginationDto<TopicDto>>(this.topicsUrl, { params }).pipe(
      map(this.mapTopicPagination),
    );
  }

  /**
   * Get followed topics.
   * @param page Number of page.
   * @param topicId
   */
  public getFollowedTopics(page: number = 0, topicId: number = null): Observable<Pagination<Follow>> {
    let params = this.defaultParams
      .set('offset', (this.TOPICS_PER_PAGE * page).toString());

    if (topicId) {
      params = params
        .set('topic', topicId.toString());
    }

    return this.http.get<PaginationDto<FollowDto>>(this.followedTopicsUrl, { params }).pipe(
      map(this.mapFollowPagination),
    );
  }

  /** Create new topic */
  public createTopic(topic: Topic): Observable<Topic> {
    return this.http
      .post<TopicDto>(this.topicsUrl, this.topicMapper.toDto(topic))
      .pipe(
        catchError((httpError: HttpErrorResponse) => {
          const apiError = this.apiErrorMapper.fromDtoWithValidationSupport(httpError, this.topicMapper);
          return throwError(apiError);
        }),
        map(data => this.topicMapper.fromDto(data)),
      );
  }

  /**
   * Get last modified topics
   * @param limit Maximum number of topics
   * */
  public getLastModifiedTopics(limit: number): Observable<Topic[]> {
    const params = new HttpParams()
      .set('ordering', '-last_post__created')
      .set('limit', limit.toString());

    return this.http
      .get<PaginationDto<TopicDto>>(this.topicsUrl, { params })
      .pipe(
        map(({ results: topics }) =>
          topics.map(topic => this.topicMapper.fromDto(topic)),
        ),
      );
  }

  /**
   * Get attorney's opportunities
   */
  public getOpportunities(reqParams?: DefaultRequestParams, shouldRefresh: boolean = true): Observable<Topic[]> {
    if (shouldRefresh) {
      this.opportunitiesRequestedWithParams$.next(reqParams);
    }
    return this.opportunitiesValue$;
  }

  private getOpportunitiesFromApi(reqParams: DefaultRequestParams): Observable<Topic[]> {
    let params = new HttpParams();
    for (const key in reqParams) {
      if (key in reqParams) {
        params = params.append(key, reqParams[key]);
      }
    }
    return this.http
      .get<PaginationDto<TopicDto>>(this.opportunitiesUrl, { params })
      .pipe(
        map(({ results: topics }) => topics.map(topic => this.topicMapper.fromDto(topic))),
      );
  }

  private mapTopicPagination = pagination => {
    return {
      items: pagination.results.map(topic =>
        this.topicMapper.fromDto(topic),
      ),
      pagesCount: Math.ceil(pagination.count / this.TOPICS_PER_PAGE),
      itemsCount: pagination.count,
    };
  }

  private mapFollowPagination = pagination => {
    return {
      items: pagination.results.map(follow => this.followMapper.fromDto(follow)),
      pagesCount: Math.ceil(pagination.count / this.TOPICS_PER_PAGE),
      itemsCount: pagination.count,
    };
  }
}

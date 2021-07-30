import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PaginationDto, ForumCategoryDto } from '@jl/common/core/dto';
import { ForumCategoryMapper } from '@jl/common/core/mappers/forum-category.mapper';
import { ForumCategory } from '@jl/common/core/models';
import { Pagination } from '@jl/common/core/models/pagination';
import { AppConfigService } from '@jl/common/core/services/app-config.service';
import { Observable } from 'rxjs';
import { map, first } from 'rxjs/operators';

interface ForumCategoriesQuery {
  /** Ordering. */
  readonly ordering?: string;
  /** Search term. */
  readonly search?: string;
}

/** Forum service. */
@Injectable({
  providedIn: 'root',
})
export class ForumService {
  private readonly baseUrl = this.appConfig.apiUrl;
  private readonly forumCategoriesUrl = new URL(
    'forum/categories',
    this.baseUrl,
  ).toString();
  private readonly categoriesPerPage = 15;
  private readonly defaultOrdering = 'created';

  /**
   * @constructor
   * @param http Http client.
   * @param forumCategoryMapper Forum category mapper.
   * @param appConfig App config.
   */
  public constructor(
    private http: HttpClient,
    private forumCategoryMapper: ForumCategoryMapper,
    private appConfig: AppConfigService,
  ) { }

  /** Default set of parameters. */
  public get defaultParams(): HttpParams {
    return new HttpParams()
      .set('limit', this.categoriesPerPage.toString())
      .set('ordering', this.defaultOrdering);
  }

  private mapCategoryPagination(pagination: PaginationDto<ForumCategoryDto>): Pagination<ForumCategory> {
    return {
      items: pagination.results.map(category =>
        this.forumCategoryMapper.fromDto(category),
      ),
      pagesCount: Math.ceil(pagination.count / this.categoriesPerPage),
      itemsCount: pagination.count,
    };
  }

  /**
   * Get forum categories
   * @param param0 Query params.
   */
  public getForumCategories({
    ordering = 'title',
    search = '',
  }: ForumCategoriesQuery): Observable<ForumCategory[]> {
    const params = new HttpParams({
      fromObject: {
        ordering,
        search,
      },
    });
    return this.http
      .get<PaginationDto<ForumCategoryDto>>(this.forumCategoriesUrl, {
        params,
      })
      .pipe(
        first(),
        map(({ results }) =>
          results.map(forumCategoryDto =>
            this.forumCategoryMapper.fromDto(forumCategoryDto),
          ),
        ),
      );
  }

  /**
   * Get category by id.
   * @param id Id.
   */
  public getCategoryById(id: number): Observable<ForumCategory> {
    return this.http
      .get<ForumCategoryDto>(`${this.forumCategoriesUrl}/${id}`)
      .pipe(
        first(),
        map(forumCategoryDto =>
          this.forumCategoryMapper.fromDto(forumCategoryDto),
        ),
      );
  }

  /**
   * Search for category
   * @param query
   * @param page
   */
  public searchCategory(
    query: string,
    page: number = 0,
  ): Observable<Pagination<ForumCategory>> {
    let params = this.defaultParams
      .set('offset', (this.categoriesPerPage * page).toString());

    if (query) {
      params = params.set('search', query);
    }

    return this.http.get<PaginationDto<ForumCategoryDto>>(this.forumCategoriesUrl, { params }).pipe(
      map((pagination) => this.mapCategoryPagination(pagination)),
    );
  }
}

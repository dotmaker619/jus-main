import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PaginationDto } from '../../dto';
import { NewsDto } from '../../dto/news-dto';
import { NewsMapper } from '../../mappers/news.mapper';
import { News } from '../../models/news';
import { Pagination } from '../../models/pagination';
import { AppConfigService } from '../app-config.service';

const NEWS_PER_PAGE = 10;

/** News service. */
@Injectable({ providedIn: 'root' })
export class NewsService {
  private readonly newsUrl: string;

  /**
  * @constructor
  *
  * @param appConfig App configuration.
  * @param http Http client
  * @param newsMapper News mapper.
  */
  public constructor(
    appConfig: AppConfigService,
    private readonly http: HttpClient,
    private readonly newsMapper: NewsMapper,
  ) {
    this.newsUrl = `${appConfig.apiUrl}news/`;
  }

  /**
   * Get list of news.
   */
  public getNews(page: number = 0): Observable<Pagination<News>> {
    const params = new HttpParams()
      .set('limit', NEWS_PER_PAGE.toString())
      .set('offset', (page * NEWS_PER_PAGE).toString())
      .set('ordering', '-created');

    return this.http.get<PaginationDto<NewsDto>>(this.newsUrl, { params }).pipe(
      map(pagination => {
        return {
          itemsCount: pagination.count,
          pagesCount: Math.ceil(pagination.count / NEWS_PER_PAGE),
          items: pagination.results.map((newsDto) => this.newsMapper.fromDto(newsDto)),
        } as Pagination<News>;
      }),
    );
  }

  /**
   * Get news details by its id.
   *
   * @param id News id.
   */
  public getNewsDetails(id: number | string): Observable<News> {
    const url = new URL(id.toString(), this.newsUrl);
    return this.http.get<NewsDto>(url.toString()).pipe(
      map((dto) => this.newsMapper.fromDto(dto)),
    );
  }
}

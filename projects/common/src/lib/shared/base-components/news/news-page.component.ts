import { News } from '@jl/common/core/models/news';
import { Pagination } from '@jl/common/core/models/pagination';
import { PostData } from '@jl/common/core/models/post-data';
import { NewsService } from '@jl/common/core/services/attorney/news.service';
import { Observable, Subject } from 'rxjs';
import { shareReplay, scan, mapTo, startWith, switchMap } from 'rxjs/operators';

/** Base class for news page component. */
export class BaseNewsPageComponent {
  /** News list. */
  public readonly pagination$: Observable<Pagination<News>>;
  /** Trigger to get news */
  protected readonly moreNews$ = new Subject<void>();

  /**
   * @constructor
   *
   * @param newsService News service.
   */
  public constructor(
    private readonly newsService: NewsService,
  ) {
    this.pagination$ = this.initNewsPaginationStream();
  }

  /**
   * TrackBy function for news list.
   *
   * @param _ Idx.
   * @param item News.
   */
  public trackNews(_: number, item: News): number {
    return item.id;
  }

  /**
   * Map News array to PostData array.
   *
   * @param news News list
   */
  public mapNewsToPostsData(news: News[]): PostData[] {
    return news.map(this.mapNewsToPostData);
  }

  /**
   * Map News object to PostData object.
   *
   * @param news News.
   */
  public mapNewsToPostData(news: News): PostData {
    return new PostData({
      author: {
        name: 'Jus-Law',
      },
      content: news.description,
      created: news.created,
      id: news.id,
      image: news.image,
      title: news.title,
    });
  }

  private initNewsPaginationStream(): Observable<Pagination<News>> {
    const pageAccumulation$ = this.moreNews$.pipe(
      mapTo(1),
      scan(((curPage) => ++curPage)),
      startWith(0),
    );

    return pageAccumulation$.pipe(
      switchMap((page) => this.newsService.getNews(page)),
      scan((prevNews: Pagination<News>, newNews: Pagination<News>) => {
        if (prevNews && newNews) {
          return {
            items: prevNews.items.concat(newNews.items),
            itemsCount: newNews.itemsCount,
          } as Pagination<News>;
        }
        return newNews;
      }, null),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
  }
}

import { ActivatedRoute } from '@angular/router';
import { News } from '@jl/common/core/models/news';
import { PostData } from '@jl/common/core/models/post-data';
import { NewsService } from '@jl/common/core/services/attorney/news.service';
import { Observable } from 'rxjs';
import { map, switchMap, first, shareReplay } from 'rxjs/operators';

/** Base class for news details component. */
export class BaseNewsDetailsComponent {
  /** News. */
  public readonly news$: Observable<PostData>;

  /**
   * @constructor
   *
   * @param route Current route.
   * @param newsService News service.
   */
  public constructor(
    route: ActivatedRoute,
    private readonly newsService: NewsService,
  ) {
    const id$ = route.paramMap.pipe(
      first(),
      map((params) => params.get('id')),
    );
    this.news$ = this.initNewsStream(id$);
  }

  private initNewsStream(id$: Observable<string>): Observable<PostData> {
    return id$.pipe(
      switchMap((id) => this.newsService.getNewsDetails(id)),
      map(this.mapNewsToPostData),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
  }

  private mapNewsToPostData(news: News): PostData {
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
}

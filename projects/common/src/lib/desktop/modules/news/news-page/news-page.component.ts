import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { News } from '@jl/common/core/models/news';
import { NewsService } from '@jl/common/core/services/attorney/news.service';
import { BaseNewsPageComponent } from '@jl/common/shared/base-components/news/news-page.component';

/** News page. */
@Component({
  selector: 'jlc-news-page',
  templateUrl: './news-page.component.html',
  styleUrls: ['./news-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsPageComponent extends BaseNewsPageComponent {

  /**
   * @constructor
   *
   * @param router Router.
   * @param newsService News service.
   */
  public constructor(
    newsService: NewsService,
    private readonly router: Router,
  ) {
    super(newsService);
  }

  /**
   * Handle 'click' of 'More news' button.
   */
  public onMoreNewsClick(): void {
    this.moreNews$.next();
  }

  /**
   * Handle 'more' of 'jlc-news-list-item' component.
   */
  public onShowMore(id: number): void {
    this.router.navigate(['/news', id]);
  }

  /**
   * TrackBy function for news list.
   *
   * @param _ Index.
   * @param item News object.
   */
  public trackNews(_: number, item: News): number {
    return item.id;
  }
}

import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NewsService } from '@jl/common/core/services/attorney/news.service';
import { BaseNewsPageComponent } from '@jl/common/shared/base-components/news/news-page.component';
import { first } from 'rxjs/operators';

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
   * @param newsService News service.
   */
  public constructor(newsService: NewsService) {
    super(newsService);
  }

  /**
   * Handle 'ionInfinite' of 'ion-infinite-scroll'
   *
   * @param event Event.
   */
  public loadMoreNews(event: CustomEvent): void {
    this.pagination$
      .pipe(first())
      // @ts-ignore the absence of `complete` on CustomEventTarget
      .subscribe(() => event.target.complete());
    this.moreNews$.next();
  }
}

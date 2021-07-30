import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NewsService } from '@jl/common/core/services/attorney/news.service';
import { BaseNewsDetailsComponent } from '@jl/common/shared/base-components/news/news-details.component';

/** News details page. */
@Component({
  selector: 'jlc-news-details',
  templateUrl: './news-details.component.html',
  styleUrls: ['./news-details.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsDetailsComponent extends BaseNewsDetailsComponent {

  /** @inheritdoc */
  public constructor(route: ActivatedRoute, newsService: NewsService) {
    super(route, newsService);
  }
}

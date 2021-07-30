import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { News } from '@jl/common/core/models/news';

/**
 * News list item component.
 */
@Component({
  selector: 'jlc-news-list-item',
  templateUrl: './news-list-item.component.html',
  styleUrls: ['./news-list-item.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsListItemComponent {
  /** News. */
  @Input()
  public news: News;
}

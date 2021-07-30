import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { ForumCategory } from '@jl/common/core/models';

/** Category list item. */
@Component({
  selector: 'jlc-category-list-item',
  templateUrl: './category-list-item.component.html',
  styleUrls: ['./category-list-item.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryListItemComponent {
  /** Default icon for categories. */
  public readonly iconFallbackUrl = '/assets/icons/category_icon.svg';

  /** Forum category. */
  @Input()
  public category: ForumCategory;
}

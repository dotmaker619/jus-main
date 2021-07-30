import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { ForumCategory } from '@jl/common/core/models';
import { trackById } from '@jl/common/core/utils/trackby-id';

/** List of categories component. */
@Component({
  selector: 'jlc-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryListComponent {
  /** Forum categories. */
  @Input()
  public categories: ForumCategory[];

  /** Trackby function. */
  public trackById = trackById;
}

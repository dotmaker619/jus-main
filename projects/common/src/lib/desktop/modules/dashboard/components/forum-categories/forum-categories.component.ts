import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ForumCategoriesBase } from '@jl/common/shared/base-components/dashboard/forum-categories.base';

/** Forum categories component for dashboard */
@Component({
  selector: 'jlc-forum-categories',
  templateUrl: './forum-categories.component.html',
  styleUrls: ['./forum-categories.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForumCategoriesComponent extends ForumCategoriesBase {
}

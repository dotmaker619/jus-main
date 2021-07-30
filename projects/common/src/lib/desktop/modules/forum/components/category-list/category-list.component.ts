import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ForumCategory } from '@jl/common/core/models';
import { Role } from '@jl/common/core/models/role';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { ForumService } from '@jl/common/core/services/forum.service';
import { Observable } from 'rxjs';

/** List of categories component. */
@Component({
  selector: 'jlc-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryListComponent {
  /** Forum categories. */
  public categories$: Observable<ForumCategory[]>;

  /**
   * Category to be selected by default.
   */
  public preselectedCategoryId: number = null;

  /** Default icon for categories. */
  public readonly iconFallbackUrl = '/assets/icons/category_icon.svg';

  /** Roles */
  public readonly roles = Role;

  /**
   * @constructor
   * @param forumService
   * @param userService
   * @param activatedRoute
   */
  public constructor(
    private forumService: ForumService,
    public userService: CurrentUserService,
    private activatedRoute: ActivatedRoute,
  ) {
    this.categories$ = this.forumService.getForumCategories({});

    const categoryId = this.activatedRoute.snapshot.queryParamMap.get('categoryId');

    if (categoryId) {
      this.preselectedCategoryId = parseInt(categoryId, 10);
    }
  }
}

import { ForumCategory } from '@jl/common/core/models';
import { Role } from '@jl/common/core/models/role';
import { ForumService } from '@jl/common/core/services/forum.service';
import { Observable } from 'rxjs';

/**
 * Base class for Forum Categories components.
 */
export class ForumCategoriesBase {
  /** Default icon for categories. */
  public readonly iconFallbackUrl = '/assets/icons/category_icon.svg';

  /** Forum categories as observable. */
  public readonly forumCategories$: Observable<ForumCategory[]> = this.forumService.getForumCategories({});

  /** Roles. */
  public readonly roles = Role;

  /**
   * @constructor
   *
   * @param forumService Forum service.
   */
  public constructor(
    private forumService: ForumService,
  ) { }
}

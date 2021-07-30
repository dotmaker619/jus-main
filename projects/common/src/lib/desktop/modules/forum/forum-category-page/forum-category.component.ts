import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ForumCategory, Topic, Link } from '@jl/common/core/models';
import { Role } from '@jl/common/core/models/role';
import { User } from '@jl/common/core/models/user';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { ForumService } from '@jl/common/core/services/forum.service';
import { TopicsService } from '@jl/common/core/services/topics.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, switchMap, shareReplay } from 'rxjs/operators';

/** Forum category page component. */
@Component({
  selector: 'jlc-forum-category',
  templateUrl: './forum-category.component.html',
  styleUrls: ['./forum-category.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForumCategoryComponent {
  /** Page change subject. */
  public pageChange$ = new BehaviorSubject<number>(0);

  /** Page count. */
  public pagesCount$: Observable<number>;

  /** Category. */
  public category$: Observable<ForumCategory>;

  /** Topics. */
  public topics$: Observable<Topic[]>;

  /** Breadcrumb links. */
  public readonly breadcrumbs$: Observable<Link<string[]>[]>;

  /**
   * Current user info.
   */
  public readonly currentUser$: Observable<User>;

  /**
   * Role enum.
   */
  public readonly roles = Role;

  /**
   * @constructor
   * @param forumService
   * @param route
   * @param topicsService
   * @param userService
   */
  public constructor(
    private topicsService: TopicsService,
    private forumService: ForumService,
    private route: ActivatedRoute,
    public userService: CurrentUserService,
  ) {
    this.currentUser$ = this.userService.currentUser$;
    const categoryId = this.route.snapshot.params.categoryId;
    this.category$ = this.forumService.getCategoryById(categoryId).pipe(
      shareReplay({ bufferSize: 1, refCount: true }),
    );

    const pagination = this.pageChange$.pipe(
      switchMap(page =>
        this.topicsService.getTopicsByCategoryId(page, categoryId),
      ),
      shareReplay({ bufferSize: 1, refCount: true }),
    );

    this.topics$ = pagination.pipe(map(p => p.items));
    this.pagesCount$ = pagination.pipe(map(p => p.pagesCount));
    this.breadcrumbs$ = this.category$.pipe(
      map(({ title, id }) => [
        { label: 'Jus-Law Forums', link: ['/forum'] },
        { label: title, link: ['/forum', 'category', id.toString()] },
      ]),
    );
  }

  /** Change current page. */
  public onPageChange(page: number): void {
    this.pageChange$.next(page);
  }
}

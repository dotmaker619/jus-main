import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ForumCategory, Topic } from '@jl/common/core/models';
import { Pagination } from '@jl/common/core/models/pagination';
import { Role } from '@jl/common/core/models/role';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { ForumService } from '@jl/common/core/services/forum.service';
import { TopicsService } from '@jl/common/core/services/topics.service';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, switchMap, shareReplay, first, filter } from 'rxjs/operators';

/** Forum category page component. */
@Component({
  selector: 'jlc-forum-category',
  templateUrl: './forum-category.component.html',
  styleUrls: ['./forum-category.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForumCategoryComponent {
  /** Page change subject. */
  public readonly pageChange$ = new BehaviorSubject<number>(0);

  /** Page count. */
  public readonly pagesCount$: Observable<number>;

  /** Category. */
  public readonly category$: Observable<ForumCategory>;

  /** Topics. */
  public readonly topics$: Observable<Topic[]>;

  /** Can create topic. */
  public readonly canCreateTopic$: Observable<boolean>;

  /** Role enum. */
  public readonly roles = Role;

  /**
   * @constructor
   * @param forumService
   * @param route
   * @param topicsService
   * @param userService
   */
  public constructor(
    private readonly topicsService: TopicsService,
    private readonly forumService: ForumService,
    private readonly route: ActivatedRoute,
    private readonly userService: CurrentUserService,
  ) {
    this.category$ = this.initCategoryStream();
    const pagination = this.initPaginationStream();
    this.topics$ = pagination.pipe(map(p => p.items));
    this.pagesCount$ = pagination.pipe(map(p => p.pagesCount));
    this.canCreateTopic$ = this.initCanCreateTopicStream();
  }

  private initCanCreateTopicStream(): Observable<boolean> {
    return this.userService.currentUser$.pipe(
      map(user => user && user.role === Role.Client),
    );
  }

  private initCategoryStream(): Observable<ForumCategory> {
    const categoryId$ = this.route.params.pipe(
      map(({ id }) => id),
      filter(id => id != null),
      first(),
    );
    return categoryId$.pipe(
      switchMap((id) => this.forumService.getCategoryById(id)),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }

  private initPaginationStream(): Observable<Pagination<Topic>> {
    return combineLatest([
      this.pageChange$,
      this.category$,
    ]).pipe(
      switchMap(([page, category]) =>
        this.topicsService.getTopicsByCategoryId(page, category.id),
      ),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }

  /** Change current page. */
  public onPageChange(page: number): void {
    this.pageChange$.next(page);
  }
}

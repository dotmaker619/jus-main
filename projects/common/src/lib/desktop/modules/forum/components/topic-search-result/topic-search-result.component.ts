import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {ForumCategory, Topic} from '@jl/common/core/models';
import { ForumService } from '@jl/common/core/services/forum.service';
import { TopicsService } from '@jl/common/core/services/topics.service';
import {
  Observable,
  merge,
  combineLatest,
  Subject,
} from 'rxjs';
import {
  map,
  switchMap,
  shareReplay,
  distinctUntilChanged, mapTo, startWith,
} from 'rxjs/operators';

/** Component with results of topic search. */
@Component({
  selector: 'jlc-topic-search-result',
  templateUrl: './topic-search-result.component.html',
  styleUrls: ['./topic-search-result.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicSearchResultComponent {
  /** Found topics. */
  public topics$: Observable<Topic[]>;

  /**
   * Found categories.
   */
  public categories$: Observable<ForumCategory[]>;

  /** Number of found elements. */
  public topicLength$: Observable<number>;

  /** Number of found elements. */
  public categoryLength$: Observable<number>;

  /** Number of pages. */
  public topicPagesCount$: Observable<number>;

  /** Number of pages. */
  public categoryPagesCount$: Observable<number>;

  /** Page change subject. */
  public topicPageChange$ = new Subject<number>();

  /**
   * Category page change subject.
   */
  public categoryPageChange$ = new Subject<number>();

  /** Current Page subject */
  public topicPage$: Observable<number>;

  /**
   * Current category page.
   */
  public categoryPage$: Observable<number>;

  /**
   * @constructor
   * @param route
   * @param topicsService
   * @param forumService
   */
  public constructor(
    private topicsService: TopicsService,
    private forumService: ForumService,
    private route: ActivatedRoute,
  ) {
    const searchChange$ = this.route.queryParamMap
      .pipe(
        map(paramsMap => paramsMap.get('query')),
        distinctUntilChanged(),
      );

    // Get current page number.
    // In case of new query, return first page.
    // In case of user page change use selected page.
    this.topicPage$ = merge(
      searchChange$.pipe(mapTo(0)),
      this.topicPageChange$.pipe(startWith(0)),
      );

    this.categoryPage$ = merge(
      searchChange$.pipe(mapTo(0)),
      this.categoryPageChange$.pipe(startWith(0)),
    );

    const topicPagination = combineLatest(
      searchChange$,
      this.topicPage$,
    ).pipe(
      switchMap(([query, page]) =>
        this.topicsService.searchTopics(query, page),
      ),
      shareReplay({ bufferSize: 1, refCount: true }),
    );

    const categoryPagination = combineLatest(
      searchChange$,
      this.categoryPage$,
    ).pipe(
      switchMap(([query, page]) =>
        this.forumService.searchCategory(query, page),
      ),
      shareReplay({bufferSize: 1, refCount: true}),
    );

    this.topics$ = topicPagination.pipe(map(p => p.items));
    this.categories$ = categoryPagination.pipe(map(p => p.items));
    this.topicLength$ = topicPagination.pipe(map(p => p.itemsCount));
    this.categoryLength$ = categoryPagination.pipe(map(p => p.itemsCount));
    this.topicPagesCount$ = topicPagination.pipe(map(p => p.pagesCount));
    this.categoryPagesCount$ = categoryPagination.pipe(map(p => p.pagesCount));
  }

  /** Emit page change. */
  public onTopicPageChange(page: number): void {
    this.topicPageChange$.next(page);
  }

  /** Emit page change. */
  public onCategoryPageChange(page: number): void {
    this.categoryPageChange$.next(page);
  }
}

import {
  Component,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ForumCategory, Topic } from '@jl/common/core/models';
import { Pagination } from '@jl/common/core/models/pagination';
import { ForumService } from '@jl/common/core/services/forum.service';
import { TopicsService } from '@jl/common/core/services/topics.service';
import { Observable, Subject, of } from 'rxjs';
import { startWith, switchMap, debounceTime, first, shareReplay, scan, mergeMap, mapTo, switchMapTo, withLatestFrom } from 'rxjs/operators';

/** Forum page component */
@Component({
  selector: 'jlc-forum',
  templateUrl: './forum.component.html',
  styleUrls: ['./forum.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForumComponent {

  /** Forum categories. */
  public readonly categories$: Observable<ForumCategory[]>;

  /** Topics. Might only be displayed while searching. */
  public readonly foundTopics$: Observable<Pagination<Topic>>;

  private readonly moreTopicsRequested$ = new Subject<void>();
  private readonly searchQueryChange$ = new Subject<string>();

  /**
   * @constructor
   * @param forumService Forum service.
   * @param topicsService Topics service.
   */
  public constructor(
    private readonly forumService: ForumService,
    private readonly topicsService: TopicsService,
  ) {
    const searchQueryChange$ = this.searchQueryChange$.pipe(
      startWith(''),
      debounceTime(300),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
    this.categories$ = this.initCategoriesStream(searchQueryChange$);
    this.foundTopics$ = this.initTopicsStream(searchQueryChange$);
  }

  /** Show topic search results. */
  public onTopicSearchChange(query: string): void {
    this.searchQueryChange$.next(query);
  }

  private initCategoriesStream(query$: Observable<string>): Observable<ForumCategory[]> {
    return query$.pipe(
      switchMap((query) => this.forumService.getForumCategories({
        search: query,
      }).pipe(
        startWith(null), // To show loading on every search
      )),
    );
  }

  /** Init topics stream. */
  private initTopicsStream(query$: Observable<string>): Observable<Pagination<Topic>> {

    const pageAccumulation$ = this.moreTopicsRequested$.pipe(
      mapTo(1), // Set number of requested pages on every emit
      startWith(0), // Set initial page
      scan(((curPage, requestedPages) => curPage + requestedPages)),
    );
    const pageChange$: Observable<number> = query$.pipe(
      switchMapTo(pageAccumulation$),
    );

    return pageChange$.pipe(
      withLatestFrom(query$),
      mergeMap(([page, query]) => {
        if (query == null || query === '') {
          // Don't display any topics on empty query
          return of<Pagination<Topic>>(null);
        }
        const newTopics$ = this.topicsService.searchTopics(query, page);

        return page !== 0 ?
          newTopics$ :
          newTopics$.pipe(startWith(null)); // To clear the accumulator
      }),
      // Accumulate loaded topics
      scan((prevTopics, newTopics) => {
        if (prevTopics && newTopics) {
          return {
            items: prevTopics.items.concat(newTopics.items),
            itemsCount: newTopics.itemsCount,
          } as Pagination<Topic>;
        }
        return newTopics;
      }, null),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }

  /**
   * Request more topics.
   * @param event Event.
   */
  public loadMoreTopics(event: CustomEvent): void {
    this.foundTopics$
      .pipe(first())
      // @ts-ignore the absence of `complete` on CustomEventTarget
      .subscribe(() => event.target.complete());
    this.moreTopicsRequested$.next();
  }
}

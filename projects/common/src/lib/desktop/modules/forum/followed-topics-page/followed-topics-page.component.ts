import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Topic, Link } from '@jl/common/core/models';
import { TopicsService } from '@jl/common/core/services/topics.service';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { switchMap, shareReplay, map } from 'rxjs/operators';

/** Followed topics page component. */
@Component({
  selector: 'jlc-followed-topics-page',
  templateUrl: './followed-topics-page.component.html',
  styleUrls: ['./followed-topics-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FollowedTopicsPageComponent {
  /** Found topics. */
  public topics$: Observable<Topic[]>;

  /** Number of pages. */
  public pagesCount$: Observable<number>;

  /** Current Page subject */
  public page$ = new BehaviorSubject<number>(0);

  /** Breadcrumb links. */
  public readonly breadcrumbs: Link[] = [
    { label: 'Jus-Law Forums', link: '/forum' },
    { label: 'Posts I Follow', link: '/forum/followed-topics' },
  ];

  /**
   * @constructor
   * @param topicsService Topics service.
   */
  public constructor(
    private topicsService: TopicsService,
  ) {
    const pagination = this.page$.pipe(
      switchMap((page) =>
        this.topicsService.getFollowedTopics(page),
      ),
      shareReplay(1),
    );

    this.topics$ = pagination
      .pipe(
        map(p => p.items),
        map(follows => follows.map(follow => follow.topic)),
      );
    this.pagesCount$ = pagination.pipe(map(p => p.pagesCount));

  }

  /** Emit page change. */
  public onPageChange(page: number): void {
    this.page$.next(page);
  }
}

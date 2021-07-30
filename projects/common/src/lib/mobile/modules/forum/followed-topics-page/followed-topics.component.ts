import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Topic } from '@jl/common/core/models';
import { TopicsService } from '@jl/common/core/services/topics.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { switchMap, shareReplay, map } from 'rxjs/operators';

/** Page for topics that a user follows. */
@Component({
  selector: 'jlc-followed-topics',
  templateUrl: './followed-topics.component.html',
  styleUrls: ['./followed-topics.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FollowedTopicsPageComponent {
  /**
   * Page change subject.
   */
  public readonly pageChange$ = new BehaviorSubject<number>(0);
  /**
   * Found topics.
   */
  public topics$: Observable<Topic[]>;
  /**
   * Number of pages.
   */
  public pagesCount$: Observable<number>;

  /**
   * @constructor
   *
   * @param topicsService Topics service.
   */
  public constructor(
    private topicsService: TopicsService,
  ) {
    const pagination = this.pageChange$.pipe(
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

  /**
   * Handle 'pageChange' event of pagination component.
   *
   * @param page Page number.
   */
  public onPageChange(page: number): void {
    this.pageChange$.next(page);
  }
}

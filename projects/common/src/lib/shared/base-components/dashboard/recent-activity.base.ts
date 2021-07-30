import { Topic } from '@jl/common/core/models';
import { TopicsService } from '@jl/common/core/services/topics.service';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

/**
 * Recent activity base class.
 */
export class RecentActivityBase {
  private readonly RECENT_ACTIVITY_LIMIT = 10;

  /** Array of last topics as observable. */
  public readonly recentActivity$: Observable<Topic[]> = this.topicsService
    .getLastModifiedTopics(this.RECENT_ACTIVITY_LIMIT)
    .pipe(
      shareReplay({
        bufferSize: 1,
        refCount: true,
      }),
    );

  /**
   * @constructor
   *
   * @param topicsService Topics service.
   */
  public constructor(
    private readonly topicsService: TopicsService,
  ) { }
}

import { Component, ChangeDetectionStrategy } from '@angular/core';
import { LeadChatInfo, Matter, Topic, CalendarQuarter } from '@jl/common/core/models';
import { AttorneyStatistic } from '@jl/common/core/models/attorney-statistic';
import { JuslawDocument } from '@jl/common/core/models/juslaw-document';
import { MatterStatus } from '@jl/common/core/models/matter-status';
import { MattersService } from '@jl/common/core/services/attorney/matters.service';
import { StatisticsService } from '@jl/common/core/services/attorney/statistics.service';
import { LeadChatService } from '@jl/common/core/services/chats/lead-chat.service';
import { DocumentsService } from '@jl/common/core/services/documents.service';
import { TopicsService } from '@jl/common/core/services/topics.service';
import { DateTime } from 'luxon';
import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

interface Dashboard {
  /**
   * Opportunities.
   */
  opportunities: Topic[];

  /**
   * Active leads.
   */
  activeLeads: LeadChatInfo[];

  /**
   * Active matters
   */
  activeMatters: Matter[];

  /**
   * Attorney documents.
   */
  documents: JuslawDocument[];

  /**
   * Period statistic.
   */
  periodStatistic: AttorneyStatistic;
}

/**
 * Dashboard page.
 */
@Component({
  selector: 'jlat-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent {

  /**
   * Opportunities card icon.
   */
  public opportunitiesCardIconUrl = '/assets/icons/opportunities-yellow.svg';

  /**
   * Active leads card icon.
   */
  public activeLeadsCardIconUrl = '/assets/icons/arrows-yellow.svg';

  /**
   * Active matters card icon.
   */
  public activeMattersCardIconUrl = '/assets/icons/file-yellow.svg';

  /**
   * Active documents card icon.
   */
  public activeDocumentsCardIconUrl = '/assets/icons/documents-yellow.svg';

  /**
   * Dashboard stream.
   */
  public readonly dashboard$: Observable<Dashboard>;

  /**
   * Opportunities stream.
   */
  public readonly opportunities$: Observable<Topic[]>;

  /**
   * Active leads stream.
   */
  public readonly activeLeads$: Observable<LeadChatInfo[]>;

  /**
   * Active matters stream.
   */
  public readonly activeMatters$: Observable<Matter[]>;

  /**
   * Count of active documents.
   */
  public readonly documents$: Observable<JuslawDocument[]>;

  /**
   * Period statistic.
   */
  public readonly periodStatistic$: Observable<AttorneyStatistic>;

  /**
   * Calendar quarter.
   */
  public quarter$: BehaviorSubject<CalendarQuarter>;

  /**
   * @constructor
   *
   * @param topicsService Topic service.
   * @param chatService Chat service.
   * @param mattersService Matters service.
   * @param statisticsService Attorney statistic service.
   * @param documentsService Documents service.
   */
  public constructor(
    private readonly topicsService: TopicsService,
    private readonly chatService: LeadChatService,
    private readonly mattersService: MattersService,
    private readonly statisticsService: StatisticsService,
    private readonly documentsService: DocumentsService,
  ) {
    this.quarter$ = new BehaviorSubject<CalendarQuarter>({
      start: DateTime.local().startOf('quarter').toISO({ includeOffset: false }),
      end: DateTime.local().endOf('quarter').toISO({ includeOffset: false }),
      quarterNumber: DateTime.local().quarter,
    });

    this.opportunities$ = this.topicsService.getOpportunities()
      .pipe(
        // Shows the most recent activity on top.
        map(topics => topics.sort((a, b) => new Date(b.lastPost.modified).valueOf() - new Date(a.lastPost.modified).valueOf())),
      );

    this.activeLeads$ = this.chatService.getCurrentUserChats();

    this.activeMatters$ = this.mattersService.getMatters({ order: '-modified', statuses: [MatterStatus.Active] });

    this.documents$ = this.documentsService.getPrivateDocs();

    this.periodStatistic$ = this.quarter$
      .pipe(
        switchMap((dates: CalendarQuarter) => this.statisticsService.getPeriodStatistic(dates.start, dates.end)),
      );

    this.dashboard$ = combineLatest(
      this.opportunities$,
      this.activeLeads$,
      this.activeMatters$,
      this.documents$,
      this.periodStatistic$,
    )
      .pipe(
        map(([
          opportunities,
          activeLeads,
          activeMatters,
          documents,
          periodStatistic,
        ]) =>
          ({
            opportunities,
            activeLeads,
            activeMatters,
            documents,
            periodStatistic,
          })),
      );
  }

  /**
   * Change quarter.
   *
   * @param quarterDates Quarter start and and dates.
   */
  public onQuarterChange(quarterDates: CalendarQuarter): void {
    this.quarter$.next(quarterDates);
  }

}

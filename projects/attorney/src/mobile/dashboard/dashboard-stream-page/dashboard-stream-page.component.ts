import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Topic, LeadChatInfo, Matter } from '@jl/common/core/models';
import { JuslawDocument } from '@jl/common/core/models/juslaw-document';
import { MatterStatus } from '@jl/common/core/models/matter-status';
import { MattersService } from '@jl/common/core/services/attorney/matters.service';
import { LeadChatService } from '@jl/common/core/services/chats/lead-chat.service';
import { DocumentsService } from '@jl/common/core/services/documents.service';
import { TopicsService } from '@jl/common/core/services/topics.service';
import { trackById } from '@jl/common/core/utils/trackby-id';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

/** Dashboard stream page for mobile device. */
@Component({
  selector: 'jlat-dashboard-stream-page',
  templateUrl: './dashboard-stream-page.component.html',
  styleUrls: ['./dashboard-stream-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardStreamPageComponent {
  /**
   * Opportunities card icon.
   */
  public opportunitiesCardIconUrl = '/assets/icons/opportunities.svg';

  /**
   * Active leads card icon.
   */
  public activeLeadsCardIconUrl = '/assets/icons/arrows.svg';

  /**
   * Active matters card icon.
   */
  public activeMattersCardIconUrl = '/assets/icons/file.svg';

  /**
   * Active documents card icon.
   */
  public activeDocumentsCardIconUrl = '/assets/icons/documents.svg';

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

  /** Trackby function. */
  public trackById = trackById;

  /**
   * @constructor
   */
  public constructor(
    private readonly topicsService: TopicsService,
    private readonly chatService: LeadChatService,
    private readonly mattersService: MattersService,
    private readonly documentsService: DocumentsService,
  ) {

    this.opportunities$ = this.topicsService.getOpportunities(
      { ordering: '-modified' },
    ).pipe(
      shareReplay({
        refCount: true,
        bufferSize: 1,
      }),
    );

    this.activeLeads$ = this.chatService.getCurrentUserChats();

    this.activeMatters$ = this.mattersService.getMatters({ order: '-modified', statuses: [MatterStatus.Active] });

    this.documents$ = this.documentsService.getPrivateDocs();
  }

}

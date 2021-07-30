import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { DestroyableBase } from '@jl/common/core';
import { LeadChatService } from '@jl/common/core/services/chats/lead-chat.service';
import { TopicsService } from '@jl/common/core/services/topics.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { LeadPreferencesComponent } from '../components/lead-preferences/lead-preferences.component';

/**
 * Leads page component.
 */
@Component({
  selector: 'jlat-leads-page',
  templateUrl: './leads-page.component.html',
  styleUrls: ['./leads-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeadsPageComponent extends DestroyableBase {

  /** Number of opportunities. */
  public readonly numberOfOpportunities$: Observable<number>;

  /** Number of active leads. */
  public readonly numberOfActiveLeads$: Observable<number>;

  /**
   * @constructor
   *
   * @param topicsService Topics service.
   * @param chatService Chats service.
   * @param modalController Modal controller.
   */
  public constructor(
    private readonly topicsService: TopicsService,
    private readonly chatService: LeadChatService,
    private readonly modalController: ModalController,
  ) {
    super();
    this.numberOfOpportunities$ = this.initNumberOfOpportunities();
    this.numberOfActiveLeads$ = this.initNumberOfActiveLeads();

  }

  /** Init number of opportunities stream. */
  public initNumberOfOpportunities(): Observable<number> {
    return this.topicsService.getOpportunities({
      ordering: '-created',
    }, true).pipe(
      map(opportunities => opportunities.length),
    );
  }

  /** Init number of active leads stream. */
  public initNumberOfActiveLeads(): Observable<number> {
    return this.chatService.getCurrentUserChats().pipe(
      map(leads => leads.length),
    );
  }

  /** Should the filter button be displayed. */
  public get shouldDisplayFilterButton(): boolean {
    // TODO (Viktor): hide filter button on Leads page.
    return true;
  }

  /** Open filter settings. */
  public async onFiltersClick(): Promise<void> {
    const modal = await this.modalController.create({
      component: LeadPreferencesComponent,
      animated: true,
      cssClass: 'custom-action-sheet',
    });
    modal.present();
  }
}

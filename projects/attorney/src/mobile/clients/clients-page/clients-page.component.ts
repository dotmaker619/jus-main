import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { MatterStatus } from '@jl/common/core/models/matter-status';
import { InvitesService } from '@jl/common/core/services/attorney/invites.service';
import { MattersService } from '@jl/common/core/services/attorney/matters.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, switchMapTo } from 'rxjs/operators';

import { InviteClientModalComponent } from '../components/invite-client-modal/invite-client-modal.component';

/**
 * Clients page for mobile workspace.
 */
@Component({
  selector: 'jlat-clients-page',
  templateUrl: './clients-page.component.html',
  styleUrls: ['./clients-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientsPageComponent {
  /**
   * Number of active clients.
   */
  public readonly activeClientsNumber$: Observable<number>;
  /**
   * Number of pending clients.
   */
  public readonly pendingClientsNumber$: Observable<number>;
  /**
   * Update emitter.
   */
  public readonly update$ = new BehaviorSubject<void>(null);

  /**
   * @constructor
   *
   * @param mattersService Matters service.
   * @param invitesService Invites service.
   * @param modalCtrl Modal controller.
   */
  public constructor(
    private readonly mattersService: MattersService,
    private readonly invitesService: InvitesService,
    private readonly modalCtrl: ModalController,
  ) {
    this.activeClientsNumber$ = this.initActiveClientsStream();
    this.pendingClientsNumber$ = this.initPendingClientsStream();
  }

  /**
   * Handles click on the 'Invite client' button.
   */
  public async onInviteClientClick(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: InviteClientModalComponent,
    });

    modal.present();
    await modal.onDidDismiss();
    this.update$.next();
  }

  private initActiveClientsStream(): Observable<number> {
    return this.update$.pipe(
      switchMapTo(this.mattersService.getMatters({ statuses: [MatterStatus.Active] })),
      map((matters) => matters.length),
    );
  }

  private initPendingClientsStream(): Observable<number> {
    return this.update$.pipe(
      switchMapTo(this.invitesService.getInvites()),
      map((invites) => invites.length),
    );
  }
}

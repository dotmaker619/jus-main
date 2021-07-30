import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Invite } from '@jl/common/core/models/invite';
import { InvitesService } from '@jl/common/core/services/attorney/invites.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { first, tap } from 'rxjs/operators';

/**
 * Pending clients page for mobile workspace.
 */
@Component({
  selector: 'jlat-pending-clients-page',
  templateUrl: './pending-clients-page.component.html',
  styleUrls: ['./pending-clients-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PendingClientsPageComponent {
  /**
   * Invites observable.
   */
  public readonly invites$: Observable<Invite[]>;

  /**
   * @constructor
   *
   * @param invitesService Invites service.
   */
  public constructor(
    private invitesService: InvitesService,
  ) {
    this.invites$ = this.initInviteStream();
  }

  /**
   * TrackBy function for invites list.
   *
   * @param _ Idx.
   * @param item Invite.
   */
  public trackInvite(_: number, item: Invite): string {
    return item.uuid;
  }

  private initInviteStream(): Observable<Invite[]> {
    return this.invitesService.getInvites()
      .pipe(first());
  }
}

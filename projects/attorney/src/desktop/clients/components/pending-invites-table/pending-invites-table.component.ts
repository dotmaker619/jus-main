import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { Invite } from '@jl/common/core/models/invite';
import { Observable } from 'rxjs';

/** Pending invites table component. */
@Component({
  selector: 'jlat-pending-invites-table',
  templateUrl: './pending-invites-table.component.html',
  styleUrls: ['./pending-invites-table.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PendingInvitesTableComponent {
  /** Invite list observable. */
  @Input()
  public invites: Invite[];

  /** Resend click event. */
  @Output()
  public clickResend = new EventEmitter<Invite>();

  /** Invite select event. */
  @Output()
  public select = new EventEmitter<Invite>();

  /** Selected invite uuid. */
  public selectedInvite: string;

  /** Track by id. */
  public trackByUUID(_: number, invite: Invite): string {
    return invite.uuid;
  }

  /** Select invite. */
  public onInviteClicked(invite: Invite): void {
    if (this.selectedInvite === invite.uuid) {
      this.selectedInvite = null;
      return;
    }
    this.selectedInvite = invite.uuid;
    this.select.emit(invite);
  }

  /** Emit click resend event. */
  public onResendClicked($event: MouseEvent, invite: Invite): void {
    $event.stopPropagation();
    this.clickResend.emit(invite);
  }
}

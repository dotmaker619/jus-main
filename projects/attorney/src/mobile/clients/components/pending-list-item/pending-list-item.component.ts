import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Invite } from '@jl/common/core/models/invite';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { InvitesService } from '@jl/common/core/services/attorney/invites.service';
import { AlertService } from '@jl/common/mobile/services/alert.service';
import { BehaviorSubject, EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';

const ERROR_DIALOG_OPTIONS = {
  header: 'An error occurred',
  message: 'Sorry, we couldn\'t process your request.',
};

/**
 * Item for pending list.
 */
@Component({
  selector: 'jlat-pending-list-item',
  templateUrl: './pending-list-item.component.html',
  styleUrls: ['./pending-list-item.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PendingListItemComponent {
  /**
   * Pending client.
   */
  @Input()
  public invite: Invite;
  /**
   * Loading controller.
   */
  public isLoading$ = new BehaviorSubject(false);

  /**
   * @constructor
   *
   * @param invitesService Invites service.
   * @param alertService Alert service.
   */
  public constructor(
    private readonly invitesService: InvitesService,
    private readonly alertService: AlertService,
  ) { }

  /**
   * Handle click on 'resend' button.
   */
  public onResendClicked(): void {
    this.isLoading$.next(true);
    this.invitesService.resendInvite(this.invite.uuid).pipe(
      catchError(() => {
        this.alertService.showNotificationAlert(ERROR_DIALOG_OPTIONS);
        return EMPTY;
      }),
      onMessageOrFailed(() => this.isLoading$.next(false)),
    ).subscribe(() => {
      const options = {
        header: 'Invitation Resent',
        message: `An invite has been successfully resent to ${this.invite.email}`,
      };
      this.alertService.showNotificationAlert(options);
    });
  }
}

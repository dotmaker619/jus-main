import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Invite } from '@jl/common/core/models/invite';
import { Matter } from '@jl/common/core/models/matter';
import { MatterStatus } from '@jl/common/core/models/matter-status';
import { InvitesService } from '@jl/common/core/services/attorney/invites.service';
import { MattersService } from '@jl/common/core/services/attorney/matters.service';
import { DialogsService } from '@jl/common/shared';
import { SuccessDialogOptions } from '@jl/common/shared/modules/dialogs/success-dialog/success-dialog.component';
import { Observable, BehaviorSubject, EMPTY } from 'rxjs';
import { finalize, catchError, shareReplay, switchMap, startWith } from 'rxjs/operators';

import { NewInviteDialogComponent } from '../dialogs/invite-form-dialog/invite-form-dialog.component';

const ERROR_DIALOG_OPTIONS = {
  title: 'An error occurred',
  message: 'Sorry, we couldn\'t process your request.',
};

/** Clients page component. */
@Component({
  selector: 'jlat-clients-page',
  templateUrl: './clients-page.component.html',
  styleUrls: ['./clients-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientsPageComponent {

  private update$ = new BehaviorSubject<void>(void 0);

  /** Invites observable. */
  public invites$: Observable<Invite[]> = this.update$.pipe(
    switchMap(() => {
      return this.invitesService.getInvites().pipe(
        startWith(null),
      );
    }),
    shareReplay({
      bufferSize: 1,
      refCount: true,
    }),
  );

  /** Active matters observable. */
  public matters$: Observable<Matter[]> = this.mattersService.getMatters({ statuses: [MatterStatus.Active] }).pipe(
    shareReplay({
      bufferSize: 1,
      refCount: true,
    }),
  );

  /** Active tab index. */
  public activeTabIndex = 0;

  /** Loading state subject. */
  public isLoading$ = new BehaviorSubject<boolean>(false);

  /**
   * @constructor
   * @param invitesService
   * @param dialogsService
   * @param mattersService
   */
  constructor(
    private invitesService: InvitesService,
    private dialogsService: DialogsService,
    private mattersService: MattersService,
  ) { }

  /** Opens invite form dialog. */
  public async onCreateInviteClicked(): Promise<void> {
    const createdInvite = await this.openNewInviteDialog();

    if (createdInvite) {
      await this.dialogsService.showSuccessDialog(this.getSuccessInviteCreateDialogOptions(createdInvite));
      this.update$.next();
    }
  }

  /** Opens invite form dialog. */
  public openNewInviteDialog(): Promise<Invite> {
    return this.dialogsService.openDialog(NewInviteDialogComponent);
  }

  /** Resend invite. */
  public onResendClicked(invite: Invite): void {
    this.isLoading$.next(true);
    this.invitesService.resendInvite(invite.uuid).pipe(
      catchError(() => {
        this.dialogsService.showInformationDialog(ERROR_DIALOG_OPTIONS);
        return EMPTY;
      }),
      finalize(() => this.isLoading$.next(false)),
    ).subscribe(() => {
      this.dialogsService.showSuccessDialog(this.getSuccessResendingDialogOptions(invite));
    });
  }

  private getSuccessInviteCreateDialogOptions(invite: Invite): SuccessDialogOptions {
    return {
      title: 'Invitation Sent',
      message: `An invite has been successfully sent to ${invite.email}`,
    };
  }

  private getSuccessResendingDialogOptions(invite: Invite): SuccessDialogOptions {
    return {
      title: 'Invitation Resent',
      message: `An invite has been successfully resent to ${invite.email}`,
    };
  }
}

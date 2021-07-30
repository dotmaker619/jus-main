import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { LeadChatInfo } from '@jl/common/core/models';
import { User } from '@jl/common/core/models/user';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { CallsService } from '@jl/common/core/services/calls.service';
import { ReplaySubject, BehaviorSubject } from 'rxjs';
import { first } from 'rxjs/operators';

/** Chat modal. */
@Component({
  selector: 'jlcl-chat-modal',
  templateUrl: './chat-modal.component.html',
  styleUrls: ['./chat-modal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatModalComponent {
  /** Chat. */
  public readonly chat$ = new ReplaySubject<LeadChatInfo>(1);
  /** Loading controller. */
  public readonly isLoading$ = new BehaviorSubject<boolean>(false);

  /**
   * Current chat.
   */
  @Input()
  public set chat(c: LeadChatInfo) {
    this.chat$.next(c);
  }

  /**
   * @constructor
   *
   * @param modalCtrl Modal controller.
   * @param callsService Call service.
   */
  public constructor(
    private readonly modalCtrl: ModalController,
    private readonly callsService: CallsService,
  ) { }

  /**
   * Handle 'click' of close button.
   */
  public onCancelClick(): void {
    this.close();
  }

  /**
   * Handle 'click' on attorney name.
   * @param id Attorney ID.
   */
  public onAttorneyNameClick(id: number): void {
    this.close(id);
  }

  /**
   * Handle 'click' of call button.
   * @param chat Chat info.
   */
  public onCallClicked(chat: LeadChatInfo): void {
    const participants: User[] = [
      chat.recipient,
      chat.sender,
    ];

    this.isLoading$.next(true);
    this.callsService.initiateVideoCallWith(participants).pipe(
      first(),
      onMessageOrFailed(() => this.isLoading$.next(false)),
    ).subscribe((call) =>
      this.callsService.proceedToCall(call));
  }

  private close(attorneyId?: number): void {
    this.modalCtrl.dismiss({ attorneyId });
  }
}

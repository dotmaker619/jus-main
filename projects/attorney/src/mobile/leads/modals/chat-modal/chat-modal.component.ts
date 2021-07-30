import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { LeadChatInfo, Client, Lead } from '@jl/common/core/models';
import { User } from '@jl/common/core/models/user';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { LeadsService } from '@jl/common/core/services/attorney/leads.service';
import { CallsService } from '@jl/common/core/services/calls.service';
import { Observable, of, NEVER, merge, ReplaySubject, combineLatest, BehaviorSubject } from 'rxjs';
import { tap, switchMapTo, withLatestFrom, switchMap, first } from 'rxjs/operators';

/** Chat modal. Used in mobile workspace. */
@Component({
  selector: 'jlat-chat-modal',
  templateUrl: './chat-modal.component.html',
  styleUrls: ['./chat-modal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatModalComponent {
  /** Is loading subject. */
  public readonly isLoading$ = new BehaviorSubject<boolean>(false);
  /** Chat. */
  public chat$ = new ReplaySubject<LeadChatInfo>(1);

  /** Chat. */
  @Input()
  public set chat(chat: LeadChatInfo) {
    this.chat$.next(chat);
  }

  /** Priority form. */
  public priorityForm$: Observable<FormGroup>;

  /**
   * @constructor
   * @param modalController Modal controller.
   * @param formBuilder Form builder.
   * @param leadsService Leads service.
   * @param router Router.
   * @param callsService Calls service.
   */
  public constructor(
    private readonly modalController: ModalController,
    private readonly formBuilder: FormBuilder,
    private readonly leadsService: LeadsService,
    private readonly router: Router,
    private readonly callsService: CallsService,
  ) {
    this.priorityForm$ = this.initPriorityFormStream();
  }

  /** Init priority form. */
  public initPriorityFormStream(): Observable<FormGroup> {
    const form = this.formBuilder.group({
      priority: [null],
    });

    const updateFormValue$ = this.chat$.pipe(
      tap(chat => form.controls.priority.setValue(chat.lead.priority)),
    );

    const changePriority$ = form.controls.priority.valueChanges.pipe(
      withLatestFrom(this.chat$),
      switchMap(([priority, chat]) => this.leadsService.changeLeadPriority(chat.lead.id, priority)),
    );

    const sideEffect$ = combineLatest([
      updateFormValue$,
      changePriority$,
    ]).pipe(switchMapTo(NEVER));

    return merge(of(form), sideEffect$);
  }

  /** On cancel click. */
  public onCancelClick(): void {
    this.modalController.dismiss();
  }

  /**
   * Open modal for creating a matter on click.
   * @param client Client.
   */
  public async onCreateMatterClick(client: Client): Promise<void> {
    await this.modalController.dismiss();
    this.router.navigate(['/matters/create'], {
      queryParams: {
        client: client.id,
      },
    });
  }

  /**
   * Handle click on lead.
   * @param lead Lead.
   */
  public onCallClicked(lead: Lead): void {
    const participants = [
      lead.attorney,
      lead.client,
    ] as User[];

    this.isLoading$.next(true);
    this.callsService.initiateVideoCallWith(participants).pipe(
      first(),
      onMessageOrFailed(() => this.isLoading$.next(false)),
    ).subscribe((call) =>
      this.callsService.proceedToCall(call));
  }
}

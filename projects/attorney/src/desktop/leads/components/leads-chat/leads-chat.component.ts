import { Component, ChangeDetectionStrategy, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DestroyableBase } from '@jl/common/core';
import { LeadChatInfo } from '@jl/common/core/models/lead-chat-info';
import { LeadsService } from '@jl/common/core/services/attorney/leads.service';
import { LeadChatService } from '@jl/common/core/services/chats/lead-chat.service';
import { BehaviorSubject } from 'rxjs';
import { switchMap, takeUntil, withLatestFrom, filter, map } from 'rxjs/operators';

/**
 * Leads chat.
 */
@Component({
  selector: 'jlat-leads-chat',
  templateUrl: './leads-chat.component.html',
  styleUrls: ['./leads-chat.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeadsChatComponent extends DestroyableBase implements OnInit {
  /**
   * Chat.
   */
  @Input()
  public set chat(value: LeadChatInfo) {
    this.chat$.next(value);
    if (value != null) {
      // Update value of form.
      this.changePriorityForm.patchValue({
        priority: value.lead.priority,
      });
    }
  }

  /**
   * Chat.
   */
  public readonly chat$ = new BehaviorSubject<LeadChatInfo>(null);

  /**
   * Change priority form control.
   */
  public changePriorityForm: FormGroup;

  /**
   * @constructor
   * @param chatService Chat service.
   * @param leadsService Leads service.
   * @param router Router service.
   */
  constructor(
    private readonly chatService: LeadChatService,
    private readonly leadsService: LeadsService,
    private readonly router: Router,
    private readonly formBuilder: FormBuilder,
  ) {
    super();
    this.changePriorityForm = this.formBuilder.group({
      priority: [null, Validators.required],
    });
  }

  /**
   * @inheritdoc
   */
  public ngOnInit(): void {
    this.changePriorityForm.valueChanges
      .pipe(
        filter(() => this.changePriorityForm.valid),
        map(values => values.priority),
        withLatestFrom(this.chat$),
        switchMap(([priority, chat]) => this.leadsService.changeLeadPriority(chat.lead.id, priority)),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  /**
   * Navigate to Create Matter page.
   */
  public onNewMatterClicked(): void {
    this.router.navigate(['matters', 'create']);
  }
}

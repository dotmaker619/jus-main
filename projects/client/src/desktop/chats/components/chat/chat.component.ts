import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Attorney } from '@jl/common/core/models/attorney';
import { LeadChatInfo } from '@jl/common/core/models/lead-chat-info';
import { UsersService } from '@jl/common/core/services/users.service';
import { ReplaySubject, Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

/**
 * Client chat component.
 */
@Component({
  selector: 'jlcl-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatComponent {

  /** Chat. */
  public chat$ = new ReplaySubject<LeadChatInfo>(1);

  /**
   * Current chat.
   */
  @Input()
  public set chat(c: LeadChatInfo) {
    this.chat$.next(c);
  }

  /** Recipient info. */
  public recipientSubtitle$: Observable<string>;

  /**
   * @constructor
   * @param usersService Users service.
   */
  public constructor(
    private readonly usersService: UsersService,
  ) {
    this.recipientSubtitle$ = this.initRecipientSubtitle();
  }

  private initRecipientSubtitle(): Observable<string> {
    return this.chat$.pipe(
      switchMap(chat => this.usersService.getAttorneyById(chat.recipient.id)),
      map(attorney => this.getAttorneySpecialties(attorney)),
    );
  }

  private getAttorneySpecialties(attorney: Attorney): string {
    return attorney && attorney.specialties
      && attorney.specialties.map(s => s.title).join(', ');
  }
}

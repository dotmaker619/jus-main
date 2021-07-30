import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { VoiceConsent } from '@jl/common/core/models/voice-consent';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { ConsentsService } from '@jl/common/core/services/consents.service';
import { trackById } from '@jl/common/core/utils/trackby-id';
import { DialogsService } from '@jl/common/shared';
import { ReplaySubject, from, of, EMPTY, BehaviorSubject } from 'rxjs';
import { first, switchMap, tap, switchMapTo, take } from 'rxjs/operators';

/** Consents list component. */
@Component({
  selector: 'jlc-consents-list',
  templateUrl: './consents-list.component.html',
  styleUrls: ['./consents-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConsentsListComponent {
  /** Is app loading. */
  public readonly isLoading$ = new BehaviorSubject<boolean>(false);

  /** Consents array. */
  @Input()
  public consents: VoiceConsent<string>[];

  /** Are consents editable. */
  @Input()
  public editable = false;

  /** Selected voice consent. */
  public readonly selectedConsent$ = new ReplaySubject<VoiceConsent>(1);

  /**
   * @constructor
   * @param consentsService Consents service.
   * @param dialogsService Dialogs service.
   */
  public constructor(
    private readonly consentsService: ConsentsService,
    private readonly dialogsService: DialogsService,
  ) { }

  /** Trackby function. */
  public trackById = trackById;

  /**
   * Handle click on delete consent button.
   * @param consent Consent to delete.
   */
  public onDeleteClick(consent: VoiceConsent): void {
    const deleteConsent$ = of(null).pipe(
      tap(() => this.isLoading$.next(true)),
      switchMapTo(this.consentsService.deleteVoiceConsent(consent.id)),
      take(1),
      onMessageOrFailed(() => this.isLoading$.next(false)),
    );

    from(this.dialogsService.showConfirmationDialog({
      confirmationButtonClass: 'danger',
      confirmationButtonText: 'Delete',
      title: `${consent.name}`,
      message: 'Are you sure you want to delete the consent?',
    })).pipe(
      switchMap(shouldDelete => shouldDelete ? deleteConsent$ : EMPTY),
    ).subscribe();
  }

  /**
   * Handle consent downloading.
   * @param consent Consent.
   */
  public onDownloadClick(consent: VoiceConsent<string>): void {
    this.consentsService.downloadVoiceConsent(consent);
  }

  /**
   * Select consent.
   * @param consent Consent.
   */
  public onConsentClick(consent: VoiceConsent): void {
    this.selectedConsent$.next(consent);
  }
}

import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import { ActionSheetButton } from '@ionic/core/';
import { VoiceConsent } from '@jl/common/core/models/voice-consent';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { ConsentsService } from '@jl/common/core/services/consents.service';
import { AlertService } from '@jl/common/mobile/services/alert.service';
import { EMPTY, of, BehaviorSubject } from 'rxjs';
import { switchMap, take, switchMapTo, tap } from 'rxjs/operators';

/** List of consents. */
@Component({
  selector: 'jlc-consents-list',
  templateUrl: './consents-list.component.html',
  styleUrls: ['./consents-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConsentsListComponent {

  /** Is app loading. */
  public readonly isLoading$ = new BehaviorSubject<boolean>(false);

  /** List of voice consents. */
  @Input()
  public consents: VoiceConsent<string>[];
  /** Editable. */
  @Input()
  public editable = false;

  /**
   * @constructor
   * @param actionSheetController
   * @param alertService
   * @param consentsService
   */
  public constructor(
    private readonly actionSheetController: ActionSheetController,
    private readonly alertService: AlertService,
    private readonly consentsService: ConsentsService,
  ) { }

  /** Handle click on voice consent. */
  public async onConsentClick(consent: VoiceConsent<string>): Promise<void> {

    const buttons: ActionSheetButton[] = [
      {
        text: 'Download',
        handler: () => this.consentsService.downloadVoiceConsent(consent),
      },
      ...this.getEditOptions(consent),
      {
        text: 'Cancel',
        role: 'cancel',
      },
    ];
    const actionSheet = await this.actionSheetController.create({
      buttons,
    });

    actionSheet.present();
  }

  private getEditOptions(consent: VoiceConsent): ActionSheetButton[] {
    const editOptions: ActionSheetButton[] = [
      {
        text: 'Delete',
        role: 'destructive',
        handler: () => this.deleteConsent(consent),
      },
    ];
    return this.editable ? editOptions : [];
  }

  private deleteConsent(consent: VoiceConsent): void {
    const deleteConsent$ = of(null).pipe(
      tap(() => this.isLoading$.next(true)),
      switchMapTo(this.consentsService.deleteVoiceConsent(consent.id)),
      take(1),
      onMessageOrFailed(() => this.isLoading$.next(false)),
    );

    this.alertService.showConfirmation({
      isDangerous: true,
      buttonText: 'Delete',
      header: `${consent.name}`,
      message: 'Are you sure you want to delete the consent?',
    }).pipe(
      switchMap(shouldDelete => shouldDelete ? deleteConsent$ : EMPTY),
    ).subscribe();
  }

  /** Trackby function. */
  public trackConsent(consent: VoiceConsent): number {
    return consent.id;
  }
}

import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { MattersService } from '@jl/common/core/services/attorney/matters.service';
import { TimeBillingService } from '@jl/common/core/services/attorney/time-billing.service';
import { AlertService } from '@jl/common/mobile/services/alert.service';
import { DialogsService } from '@jl/common/shared';
import { LogTimeDialogComponent } from '@jl/common/shared/modules/dialogs/log-time-dialog/log-time-dialog.component';
import { from } from 'rxjs';
import { switchMap, filter, tap, finalize, take } from 'rxjs/operators';

/** Log time modal. Used on mobile workspace. */
@Component({
  selector: 'jlc-log-time-modal-mobile',
  templateUrl: './log-time-modal-mobile.component.html',
  styleUrls: ['./log-time-modal-mobile.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogTimeModalMobileComponent extends LogTimeDialogComponent {

  /**
   * @constructor
   * @param timeBillingService
   * @param fb
   * @param mattersService
   * @param dialogsService
   * @param modalController
   */
  public constructor(
    protected readonly timeBillingService: TimeBillingService,
    protected readonly fb: FormBuilder,
    protected readonly mattersService: MattersService,
    protected readonly dialogsService: DialogsService,
    protected readonly modalController: ModalController,
    private readonly alertService: AlertService,
  ) {
    super(
      timeBillingService,
      fb,
      mattersService,
      dialogsService,
    );
  }

  /** @inheritdoc */
  public onSubmit(): void {
    super.performSavingAction().pipe(
      switchMap(() => this.alertService.showNotificationAlert({
        header: 'Time Logged',
      })),
    ).subscribe(() => this.modalController.dismiss());
  }

  /** @inheritdoc */
  public onCloseClicked(): void {
    this.modalController.dismiss();
  }

  /**
   * Ask permission to delete a job, if the answer is positive - delete it.
   */
  public onDeleteClicked(): void {
    from(this.alertService.showConfirmation({
      header: 'Delete',
      message: 'Are you sure you want to delete the job?',
      isDangerous: true,
    })).pipe(
      filter(shouldDelete => shouldDelete),
      tap(() => this.isLoading$.next(true)),
      switchMap(() => this.timeBillingService.removeBilling(this.timeBilling.id)),
      finalize(() => this.isLoading$.next(false)),
      take(1),
    ).subscribe(() => this.modalController.dismiss());
  }
}

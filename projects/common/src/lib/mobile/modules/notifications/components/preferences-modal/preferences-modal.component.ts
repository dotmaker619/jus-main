import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NotificationTypeDescriptionOrGroup } from '@jl/common/core/models/notification-group';
import { NotificationsService } from '@jl/common/core/services/notifications.service';
import { NotificationsSettingsComponent } from '@jl/common/shared/components/notifications-settings/notifications-settings.component';

/**
 * Modal to select notification preferences.
 */
@Component({
  selector: 'jlc-preferences-modal',
  templateUrl: './preferences-modal.component.html',
  styleUrls: ['./preferences-modal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreferencesModalComponent extends NotificationsSettingsComponent {
  /**
   * @constructor
   *
   * @param modalCtrl Modal controller.
   * @param notificationsService Notifications service.
   */
  public constructor(
    private readonly modalCtrl: ModalController,
    protected readonly notificationsService: NotificationsService,
  ) {
    super(notificationsService);
  }

  /**
   * Handle 'click' event of 'Close' button.
   */
  public onCloseClick(): void {
    this.modalCtrl.dismiss();
  }

  /**
   * TrackBy function for type list.
   *
   * @param _ Idx.
   * @param item Type.
   */
  public trackTypeOrGroup(_: number, item: NotificationTypeDescriptionOrGroup): string {
    return `${item.id}${item.title}`;
  }
}

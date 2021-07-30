import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NotificationsService } from '@jl/common/core/services/notifications.service';
import { BaseNotifications } from '@jl/common/shared/base-components/notifications/notifications.base';
import { from, Observable } from 'rxjs';
import { first, switchMap } from 'rxjs/operators';

import { PreferencesModalComponent } from '../components/preferences-modal/preferences-modal.component';

/**
 * Notifications page.
 */
@Component({
  selector: 'jlc-notifications-page',
  templateUrl: './notifications-page.component.html',
  styleUrls: ['./notifications-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsPageComponent extends BaseNotifications {
  /**
   * Number of unread notifications.
   */
  public readonly unreadNotificationsAmount$: Observable<number>;

  /**
   * @constructor
   *
   * @param modalCtrl Modal controller.
   * @param notificationsService Notification service.
   */
  public constructor(
    private readonly modalCtrl: ModalController,
    protected readonly notificationsService: NotificationsService,
  ) {
    super(notificationsService);
    this.unreadNotificationsAmount$ = this.notificationsService.unreadNotifications$;
  }

  /**
   * Handle 'click' event of the 'Preferences' button.
   */
  public onPreferencesClick(): void {
    from(this.modalCtrl.create({ component: PreferencesModalComponent }))
      .pipe(
        first(),
        switchMap((modal) => modal.present() && modal.onDidDismiss()),
      ).subscribe();
  }

  /**
   * Ionic's hook, activated after entering the view.
   */
  public ionViewDidEnter(): void {
    /**
     * Emit current value so that Angular would
     * keep up with updating layout after back navigation.
     */
    this.isLoading$.next(this.isLoading$.value);
  }
}

import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { NotificationsSettingsKey } from '@jl/common/core/models/notification-config';
import { NotificationsService } from '@jl/common/core/services/notifications.service';
import { BehaviorSubject } from 'rxjs';
import { finalize, shareReplay } from 'rxjs/operators';

/** Notifications Settings component. */
@Component({
  selector: 'jlc-notifications-settings',
  templateUrl: './notifications-settings.component.html',
  styleUrls: ['./notifications-settings.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsSettingsComponent {

  /** Shows whether we should display settings for Application or not. */
  @Input()
  public shouldDisplayAppConfig = true;

  /** Notifications Types as observable. */
  public readonly notificationsTypesGrouped$ = this.notificationsService.notificationsTypesGrouped$
    .pipe(shareReplay({ bufferSize: 1, refCount: true }));

  /** Is loading as observable. */
  public readonly isUpdating$ = new BehaviorSubject(false);

  /** @constructor */
  public constructor(
    protected notificationsService: NotificationsService,
  ) { }

  /**
   * Change byEmail value
   * @param typeId Notifications type identifier
   * @param value
   * */
  public changeByEmail(typeId: number, value: boolean): void {
    this.changeValue(typeId, 'byEmail', value);
  }

  /**
   * Change byPush value
   * @param typeId Notifications type identifier
   * @param value
   * */
  public changeByPush(typeId: number, value: boolean): void {
    this.changeValue(typeId, 'byPush', value);
  }

  private changeValue(typeId: number, key: NotificationsSettingsKey, value: boolean): void {
    this.isUpdating$.next(true);

    this.notificationsService.setNotificationsSettings(typeId, { [key]: value })
      .pipe(
        finalize(() => this.isUpdating$.next(false)),
      )
      .subscribe();
  }
}

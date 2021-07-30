import { OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { NotificationReceivingService } from '@jl/attorney/shared/services/notification-receiving.service';
import { DestroyableBase } from '@jl/common/core';
import { NotificationType } from '@jl/common/core/models/notification-type';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { AuthService } from '@jl/common/core/services/auth.service';
import { NotificationsService } from '@jl/common/core/services/notifications.service';
import { BehaviorSubject, NEVER } from 'rxjs';
import { switchMap, tap, takeUntil, switchMapTo } from 'rxjs/operators';

/**
 * Base client app class.
 */
export abstract class BaseClientApp extends DestroyableBase implements OnInit {
  /** Is loading. */
  public readonly isLoading$ = new BehaviorSubject<boolean>(false);

  /**
   * @constructor
   * @param platform
   * @param statusBar
   * @param ngZone
   * @param notificationsService
   * @param authService
   * @param router
   * @param notificationReceivingService
   */
  public constructor(
    protected readonly platform: Platform,
    protected readonly notificationsService: NotificationsService,
    protected readonly authService: AuthService,
    protected readonly router: Router,
    protected readonly notificationReceivingService: NotificationReceivingService,
  ) {
    super();
  }

  /** @inheritdoc */
  public ngOnInit(): void {
    this.platform.ready().then(() => {
      // Subscribe for background notifications.
      this.notificationsService.handlePushNotificationReceiving(
        (notification$) => {
          return notification$.pipe(
            tap(({ type }) => type !== NotificationType.NewVideoCall && this.isLoading$.next(true)),
            switchMap((n) => this.notificationReceivingService.handleOpenedNotification(n)),
            onMessageOrFailed(() => this.isLoading$.next(false)),
            switchMapTo(NEVER),
          );
        },
        (notification$) => {
          return notification$.pipe(
            switchMap((n) => this.notificationReceivingService.handleNotOpenedNotification(n)),
            switchMapTo(NEVER),
          );
        },
      ).pipe(
        takeUntil(this.destroy$),
      ).subscribe();
    });
  }
}

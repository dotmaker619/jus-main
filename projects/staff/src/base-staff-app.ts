import { OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { NotificationReceivingService } from '@jl/attorney/shared/services/notification-receiving.service';
import { DestroyableBase } from '@jl/common/core';
import { NotificationType } from '@jl/common/core/models/notification-type';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { AuthService } from '@jl/common/core/services/auth.service';
import { NotificationsService } from '@jl/common/core/services/notifications.service';
import { NEVER, BehaviorSubject } from 'rxjs';
import { tap, switchMap, switchMapTo, takeUntil, first } from 'rxjs/operators';

/** Base class for staff app. */
export abstract class BaseStaffApp extends DestroyableBase implements OnInit {
  /** Is loading. */
  public readonly isLoading$ = new BehaviorSubject<boolean>(false);

  /** Notifications. */
  protected readonly notificationsCount$ = this.notificationsService.unreadNotifications$;

  /**
   * @constructor
   * @param authService Auth service.
   * @param router Router.
   * @param notificationsService Notifications service.
   * @param platform Platform.
   */
  public constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly notificationsService: NotificationsService,
    private readonly notificationReceivingService: NotificationReceivingService,
    private readonly platform: Platform,
  ) {
    super();
  }

  /** @inheritdoc */
  public ngOnInit(): void {
    this.platform.ready().then(() => {
      // Subscribe for notifications.
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

  /**
   * Perform logout action.
   */
  public onLogOutClick(): void {
    this.authService.logout().pipe(
      first(),
      takeUntil(this.destroy$),
    ).subscribe(() => this.router.navigateByUrl('/auth'));
  }
}

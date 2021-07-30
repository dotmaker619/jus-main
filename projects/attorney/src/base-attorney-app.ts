import { NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Platform } from '@ionic/angular';
import { DestroyableBase } from '@jl/common/core';
import { NotificationType } from '@jl/common/core/models/notification-type';
import { Role } from '@jl/common/core/models/role';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { AuthService } from '@jl/common/core/services/auth.service';
import { NotificationsService } from '@jl/common/core/services/notifications.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { NEVER, BehaviorSubject } from 'rxjs';
import { takeUntil, switchMap, tap, switchMapTo } from 'rxjs/operators';

import { NotificationReceivingService } from './shared/services/notification-receiving.service';

/** Base class for the main component of Attorney application. Contains base Cordova preparations. */
export abstract class BaseAttorneyApp extends DestroyableBase implements OnInit {
  /** Is loading. */
  public readonly isLoading$ = new BehaviorSubject<boolean>(false);

  private readonly defaultPerms = [Role.Unauthorized];

  /**
   * @constructor
   * @param platform
   * @param router
   * @param permService
   * @param authService
   * @param notificationsService
   * @param notificationReceivingService
   */
  public constructor(
    protected readonly platform: Platform,
    protected readonly router: Router,
    protected readonly permService: NgxPermissionsService,
    protected readonly authService: AuthService,
    protected readonly notificationsService: NotificationsService,
    protected readonly notificationReceivingService: NotificationReceivingService,
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
    this.permService.loadPermissions(this.defaultPerms);

    this.authService.userType$.pipe(
      takeUntil(this.destroy$),
    ).subscribe(
      userType => {
        this.permService.loadPermissions([userType]);
      },
    );
  }
}

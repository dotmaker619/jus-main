import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { Platform } from '@ionic/angular';
import { PaginationDto } from '@jl/common/core/dto';
import { NotificationTypeDescriptionDto } from '@jl/common/core/dto/notification-config-dto';
import { NotificationSettingsDto } from '@jl/common/core/dto/notification-settings-dto';
import { NotificationTypeDescription, NotificationsSettings } from '@jl/common/core/models/notification-config';
import { NotificationTypeDescriptionOrGroup } from '@jl/common/core/models/notification-group';
import { AppConfigService } from '@jl/common/core/services/app-config.service';
import { Observable, forkJoin, of, throwError, from, OperatorFunction, Subject, combineLatest, merge, NEVER, timer } from 'rxjs';
import {
  map,
  first,
  switchMap,
  shareReplay,
  catchError,
  tap,
  mapTo,
  startWith,
  filter,
  switchMapTo,
  distinctUntilChanged,
  pluck,
  distinctUntilKeyChanged,
  skip,
} from 'rxjs/operators';

import { FcmNotificationDto } from '../dto/fcm-notification-dto';
import { NotificationDispatchDto } from '../dto/notification-dispatch-dto';
import { NotificationStatusDto } from '../dto/notification-status-dto';
import { NotificationMapper } from '../mappers/notification.mapper';
import { ExtendedNotification } from '../models/extended-notification';
import { FcmNotification } from '../models/fcm-notification';
import { NotificationStatus } from '../models/notification-status';
import { ShortNotification } from '../models/short-notification';
import { User } from '../models/user';

import { LeadsService } from './attorney/leads.service';
import { CurrentUserService } from './current-user.service';

const NOTIFICATIONS_UPDATE_PERIOD = 7000;
const NOTIFICATIONS_ORDERING = '-created';

/**
 * Service for notification handling.
 */
@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  // Urls:
  private readonly baseUrl = this.appConfig.apiUrl;
  private readonly notificationsUrl = new URL('notifications/', this.baseUrl).toString();
  private readonly notificationsSettingsUrl = new URL('settings/', this.notificationsUrl).toString();
  private readonly notificationsTypesUrl = new URL('types/', this.notificationsUrl).toString();

  /** Unread notification subject. */
  private readonly notificationsChange$ = new Subject<void>();
  private readonly appNotificationOpened$ = new Subject<ShortNotification>();

  /** Number of unread notifications observable. */
  public readonly unreadNotifications$: Observable<number> = this.initNotificationsCountStream();

  /** Array of notifications types or groups as observable */
  public readonly notificationsTypesGrouped$ = this.getNotificationsTypesGrouped();

  /**
   * @constructor
   * @param httpClient Http client.
   * @param appConfig App config.
   * @param notificationMapper Notification mapper.
   * @param platform Platform.
   * @param ngZone Zone
   * @param firebase Firebase service.
   * @param userService User service.
   * @param leadsService Leads service.
   */
  public constructor(
    private readonly httpClient: HttpClient,
    private readonly appConfig: AppConfigService,
    private readonly notificationMapper: NotificationMapper,
    private readonly platform: Platform,
    private readonly ngZone: NgZone,
    private readonly firebase: FirebaseX,
    private readonly userService: CurrentUserService,
    private readonly leadsService: LeadsService,
  ) { }

  /**
   * Set Notifications Settings by type id, key and value
   * @param typeId Notifications type identifier
   * @param newSettings Notifications type settings
   * */
  public setNotificationsSettings(typeId: number, newSettings: Partial<NotificationsSettings>): Observable<NotificationSettingsDto> {
    return this.getNotificationsTypeWithSettingsById(typeId)
      .pipe(
        first(),
        switchMap((type) => {
          type.settings = {
            ...type.settings,
            ...newSettings,
          };

          return this.createOrUpdateNotificationsSettings(type);
        }),
      );
  }

  /**
   * Get all notifications.
   * @param limit Limit of notifications.
   */
  public getNotifications(limit: number = 100): Observable<ExtendedNotification[]> {
    const params = new HttpParams({
      fromObject: {
        limit: limit.toString(),
        ordering: NOTIFICATIONS_ORDERING,
      },
    });

    return this.httpClient.get<PaginationDto<NotificationDispatchDto>>(
      this.notificationsUrl,
      { params },
    ).pipe(
      map(({ results }) =>
        results.map(notificationDto =>
          this.notificationMapper.fromDto(notificationDto),
        ),
      ),
    );
  }

  /**
   * Mark notification as read.
   * @param notification Notification.
   */
  public setNotificationRead(dispatchId: number): Observable<void> {
    return this.httpClient.post<void>(`${this.notificationsUrl}${dispatchId}/read/`, {}).pipe(
      tap(() => this.notificationsChange$.next()),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 403) {
          // Ignore the error about setting status 'read' if it is already set.
          return of(null);
        }
        // Otherwise return error
        return throwError(error);
      }),
    );
  }

  /**
   * Push notification into a global stream so that the application could handle it.
   * @param notification Notification.
   */
  public pushNotification(notification: ShortNotification): void {
    this.appNotificationOpened$.next(notification);
  }

  /**
   * Handle receiving of new push notifications.
   * @param afterOpenedOperator Rx operator to perform side effect after notification was opened.
   * @param afterreceivedOperator Rx operator to perform side effect after notification was received by device.
   */
  public handlePushNotificationReceiving(
    afterOpenedOperator?: OperatorFunction<ShortNotification, never>,
    afterReceivedOperator?: OperatorFunction<ShortNotification, never>,
  ): Observable<never> {
    const isNativeNotificationsAvailable$ = of(this.checkNotificationsAvailable()).pipe(
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
    const nativeNotificationEmitted$ = isNativeNotificationsAvailable$.pipe(
      switchMapTo(this.getNativeNotificationsChange()),
    );

    // Received notifications on foreground (not yet opened by a user).
    const nativeNotificationReceived$ = nativeNotificationEmitted$.pipe(
      filter(({ isTapped }) => !isTapped),
    );

    // Native notifications that were opened (clicked by a user).
    const nativeNotificationOpened$ = nativeNotificationEmitted$.pipe(
      filter(({ isTapped }) => isTapped),
    );

    const notificationsCountChangedOverTime$ = timer(0, NOTIFICATIONS_UPDATE_PERIOD).pipe(
      switchMapTo(this.getLastNotification()),
      distinctUntilKeyChanged('dispatchId'),
      skip(1),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );

    const notificationReceived$ = isNativeNotificationsAvailable$.pipe(
      switchMap(
        isNativeNotifications =>
          isNativeNotifications ?
            nativeNotificationReceived$
            : notificationsCountChangedOverTime$,
      ),
      // Let the service know that notifications were changed.
      tap(() => this.notificationsChange$.next()),
    );

    // Both in-app and native notifications that were opened.
    const anyNotificationOpened$ = merge(
      this.appNotificationOpened$,
      nativeNotificationOpened$,
    );

    const sideEffects$ = merge(
      notificationReceived$,
      // Notification opened side effects.
      anyNotificationOpened$.pipe(
        afterOpenedOperator || tap(),
      ),
      anyNotificationOpened$.pipe(
        filter(notification => notification.status !== NotificationStatus.Read),
        switchMap(notification => this.setNotificationRead(notification.dispatchId)),
      ),
      // Notification received side effects.
      notificationReceived$.pipe(
        afterReceivedOperator || tap(),
      ),
    ).pipe(
      switchMapTo(NEVER),
    );

    return sideEffects$.pipe(
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
  }

  /** Obtain last notification dispatch from back-end API. */
  private getLastNotification(): Observable<ShortNotification> {
    const params = new HttpParams({
      fromObject: {
        limit: '1',
        ordering: NOTIFICATIONS_ORDERING,
      },
    });
    return this.httpClient.get<PaginationDto<NotificationDispatchDto>>(
      this.notificationsUrl,
      { params },
    ).pipe(
      pluck('results'),
      map(([dto]) => this.notificationMapper.fromDto(dto)),
      filter(n => n != null),
    );
  }

  /**
   * Emits in case of receiving the notification when application is on foreground
   * and when a user opens a push notification (application is in background).
   */
  private getNativeNotificationsChange(): Observable<FcmNotification> {
    return this.firebase.onMessageReceived().pipe(
      this.runInZone(),
      /**
       * Run code below in ngZone because there
       *  is no active Angular execution context
       *  when user clicks on a background notification.
       */
      map((data: FcmNotificationDto) => this.mapFcmFromDto(data)),
      catchError(() => {
        // Catch the case where cordova is not available.
        console.warn('Native notifications are not available for this type of device.');
        return NEVER;
      }),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
  }

  private getUnreadNotificationsCount(): Observable<number> {
    const unreadStatuses: NotificationStatusDto[] = ['prepared', 'sent'];

    const params = new HttpParams({
      fromObject: {
        // Set limit as 1 to avoid loading many objects every time we want to update number of notifications
        limit: '1',
        status__in: unreadStatuses.join(','),
      },
    });
    return this.httpClient.get<PaginationDto<NotificationDispatchDto>>(this.notificationsUrl, { params }).pipe(
      map(pagination => pagination.count),
    );
  }

  private getNotificationsTypesGrouped(): Observable<NotificationTypeDescriptionOrGroup[]> {
    return forkJoin([
      this.getNotificationsTypes().pipe(first()),
      this.getNotificationsSettings().pipe(first()),
    ])
      .pipe(
        map(([types, settings]) =>
          this.notificationMapper.typeDescriptionFromDto({ types, settings }),
        ),
      );
  }

  private createOrUpdateNotificationsSettings(type: NotificationTypeDescription): Observable<NotificationSettingsDto> {
    return this.httpClient.post<NotificationSettingsDto>(
      this.notificationsSettingsUrl,
      this.notificationMapper.settingsToDto(type),
    )
      .pipe(first());
  }

  private getNotificationsTypeWithSettingsById(id: number): Observable<NotificationTypeDescription> {
    return this.getNotificationsSettings()
      .pipe(
        map(settings =>
          settings.find(item => item.notification_type === id) || null,
        ),
        map(setting => new NotificationTypeDescription({
          id,
          settings: {
            byEmail: (setting && setting.by_email) || false,
            byPush: (setting && setting.by_push) || false,
          },
        })),
      );
  }

  private getNotificationsSettings(): Observable<NotificationSettingsDto[]> {
    return this.httpClient
      .get<PaginationDto<NotificationSettingsDto>>(this.notificationsSettingsUrl)
      .pipe(map(pagination => pagination.results));
  }

  private getNotificationsTypes(): Observable<NotificationTypeDescriptionDto[]> {
    const params = (new HttpParams())
      .set('ordering', '-group');

    return this.httpClient
      .get<PaginationDto<NotificationTypeDescriptionDto>>(this.notificationsTypesUrl, { params })
      .pipe(map(pagination => pagination.results));
  }

  private runInZone<T>(): OperatorFunction<T, T> {
    return (source) => new Observable(observer => {
      const onNext = (value: T) => this.ngZone.run(() => observer.next(value));
      const onError = (e: any) => this.ngZone.run(() => observer.error(e));
      const onComplete = () => this.ngZone.run(() => observer.complete());
      return source.subscribe(onNext, onError, onComplete);
    });
  }

  private checkNotificationsAvailable(): boolean {
    return this.platform.is('cordova');
  }

  private mapFcmFromDto(notification: FcmNotificationDto): FcmNotification {
    return {
      ...this.notificationMapper.shortNotificationFromDto(notification),
      isTapped: notification.tap != null,
      dispatchId: parseInt(notification.dispatch_id, 10),
      status: NotificationStatus.Sent,
    } as FcmNotification;
  }

  private initNotificationsCountStream(): Observable<number> {
    const userChange$: Observable<User> = this.userService.currentUser$.pipe(
      distinctUntilChanged((prevUser: User, curUser: User) => {
        if (curUser == null) {
          return false;
        }
        return prevUser == null ? false : prevUser.id === curUser.id;
      }),
    );

    const notificationChange$ = this.notificationsChange$.pipe(
      startWith(null),
    );

    return combineLatest([
      userChange$,
      notificationChange$,
    ]).pipe(
      tap(() => this.notificationArrivedSideEffect()),
      switchMap(([user]) => user == null ? of(0) : this.getUnreadNotificationsCount()),
      shareReplay({
        refCount: true,
        bufferSize: 1,
      }),
    );
  }

  private notificationArrivedSideEffect(): void {
    this.leadsService.updateLeads();
  }
}

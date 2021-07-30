import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { Platform } from '@ionic/angular';
import { Observable, of, OperatorFunction, from, EMPTY, merge } from 'rxjs';
import { switchMap, mapTo, first, switchMapTo, catchError, startWith, filter, defaultIfEmpty, tap } from 'rxjs/operators';

import { ApiErrorMapper } from '../mappers/api-error.mapper';
import { LoginMapper } from '../mappers/login.mapper';
import { ResetPasswordConfirmationMapper } from '../mappers/reset-password-confirmation.mapper';
import { ResetPasswordMapper } from '../mappers/reset-password.mapper';
import { AuthData } from '../models/auth-data';
import { Login } from '../models/login';

import { AppConfigService } from './app-config.service';
import { AuthService } from './auth.service';

type PlatformType = 'ios' | 'android' | 'web';

interface FcmDevice {
  /**
   * Fcm device registration id.
   */
  id?: number;
  /**
   * Token for the registration of device.
   */
  registration_id: string;
  /**
   * Is subscription for notifications active.
   */
  active: boolean;
  /**
   * Device type.
   */
  type: PlatformType;
}

/**
 * Provides all the functionality of Auth service.
 * Modifies logic of `login` and `logout` actions by adding the subscription/unsubscription to Firebase notifications.
 */
@Injectable()
export class DeviceAuthService extends AuthService {
  private readonly fcmUrl: string;

  /**
   * @constructor
   * @param appConfigService
   * @param http
   * @param router
   * @param loginMapper
   * @param resetPasswordMapper
   * @param resetPasswordConfirmationMapper
   * @param apiErrorMapper
   * @param notificationsService
   */
  public constructor(
    appConfigService: AppConfigService,
    http: HttpClient,
    router: Router,
    loginMapper: LoginMapper,
    resetPasswordMapper: ResetPasswordMapper,
    resetPasswordConfirmationMapper: ResetPasswordConfirmationMapper,
    apiErrorMapper: ApiErrorMapper,
    private readonly httpClient: HttpClient,
    private readonly platform: Platform,
    private readonly firebase: FirebaseX,
  ) {
    super(
      appConfigService,
      http,
      router,
      loginMapper,
      resetPasswordMapper,
      resetPasswordConfirmationMapper,
      apiErrorMapper,
    );
    this.fcmUrl = new URL('fcmdevices/', appConfigService.apiUrl).toString();
  }

  /** @inheritdoc */
  public login(credentials: Login): Observable<AuthData> {
    return super.login(credentials).pipe(
      switchMap(authData =>
        merge(
          of(authData),
          // So not to block auth data stream
          this.registerDevice().pipe(switchMapTo(EMPTY)),
        ),
      ),
    );
  }

  /** @inheritdoc */
  public logout(): Observable<void> {
    return this.removeDevice().pipe(
      first(),
      catchError(() => {
        console.warn('Unable to unsubscribe from notifications');
        return of(null); // Do not interrupt logout anyway
      }),
      switchMapTo(super.logout()),
    );
  }

  /** Register application token */
  private registerDevice(): Observable<void> {
    const permission$ = from(this.platform.ready()).pipe(
      switchMap(() => this.firebase.hasPermission()),
      switchMap((hasPermission) => hasPermission ? of(hasPermission) : this.firebase.grantPermission()),
    );
    const token$ = this.firebase.onTokenRefresh().pipe(
      startWith(null),
      switchMap(() => this.firebase.getToken()),
      filter(token => !!token),
      first(),
    );

    return of(null).pipe(
      switchMapTo(permission$),
      switchMapTo(token$),
      switchMap(token => this.saveDeviceToken(token)),
    );
  }

  private saveDeviceToken(token: string): Observable<void> {
    return this.httpClient.post(this.fcmUrl, {
      active: true,
      registration_id: token,
      type: this.currentDeviceType,
    } as FcmDevice).pipe(
      this.handleNotificationRegistrationError(),
      mapTo(void 0),
    );
  }

  private get currentDeviceType(): PlatformType {
    switch (true) {
      case this.platform.is('android'):
        return 'android';
      case this.platform.is('ios'):
        return 'ios';
      default:
        return 'web';
    }
  }

  /**
   * Handle case where the device is already registered for notifications.
   */
  private handleNotificationRegistrationError(): OperatorFunction<string | HttpErrorResponse, void> {
    return catchError((error: string | HttpErrorResponse) => {
      // Token already bound to some user on this device, update user for the token
      if (error instanceof HttpErrorResponse && error.status === 400) {
        return from(this.firebase.getToken()).pipe(
          switchMap(token => {
            return this.httpClient.patch(`${this.fcmUrl}${token}/`, {
              active: true,
              registration_id: token,
              type: this.currentDeviceType,
            } as FcmDevice);
          }),
        );
      }
      return of(null);
    });
  }

  /**
   * Remove fcm token from database.
   */
  private removeDevice(): Observable<void> {
    return of(null).pipe(
      switchMap(() => this.platform.ready()),
      switchMap(() => this.firebase.getToken()),
      switchMap(token => token
        ? this.httpClient.delete(`${this.fcmUrl}${token}/`)
        : of(null),
      ),
      mapTo(void 0),
    );
  }
}

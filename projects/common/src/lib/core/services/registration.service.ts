import { HttpErrorResponse, HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, of, combineLatest } from 'rxjs';
import { switchMap, catchError, map, first, mapTo } from 'rxjs/operators';

import { AttorneyRegistrationDto } from '../dto/attorney-registration-dto';
import { ClientRegistrationDto } from '../dto/client-registration-dto';
import { ApiErrorMapper } from '../mappers/api-error.mapper';
import { AttorneyRegistrationMapper } from '../mappers/attorney-registration.mapper';
import { ClientRegistrationMapper } from '../mappers/client-registration.mapper';
import { StaffRegistrationMapper } from '../mappers/staff-registration.mapper';
import { ClientRegistration } from '../models';
import { ApiValidationError } from '../models/api-error';
import { AttorneyRegistration } from '../models/attorney-registration';
import { StaffRegistration } from '../models/staff-registration';

import { AppConfigService } from './app-config.service';
import { FileStorageService } from './file-storage.service';

/** Registration service. */
@Injectable({
  providedIn: 'root',
})
export class RegistrationService {
  private readonly baseUrl = this.appConfig.apiUrl;

  // Mappers
  private readonly attorneyRegistrationMapper = new AttorneyRegistrationMapper();
  private readonly clientRegistrationMapper = new ClientRegistrationMapper();
  private readonly staffRegistrationMapper = new StaffRegistrationMapper();

  // Endpoints
  private readonly attorneyUsersUrl = new URL('users/attorneys/', this.baseUrl).toString();
  private readonly clientUsersUrl = new URL('users/clients/', this.baseUrl).toString();
  private readonly staffUsersUrl = new URL('users/support/', this.baseUrl).toString();
  private readonly attorneyValidationUrl = new URL('users/attorneys/validate-registration/', this.baseUrl).toString();

  /**
   * @constructor
   * @param http Http client.
   * @param apiErrorMapper Api error mapper.
   * @param appConfig Application config service.
   * @param fileStorageService File storage service.
   */
  public constructor(
    private readonly http: HttpClient,
    private readonly apiErrorMapper: ApiErrorMapper,
    private readonly appConfig: AppConfigService,
    private readonly fileStorageService: FileStorageService,
  ) { }

  /**
   * Validate first step in registration of attorney.
   *
   * @param registerData Registration data.
   */
  public validateAttorneyRegistrationStep(
    registerData: AttorneyRegistration,
    step: 'first' | 'second',
  ): Observable<ApiValidationError<AttorneyRegistration> | null> {
    const params = new HttpParams({
      fromObject: {
        stage: step,
      },
    });

    const attorneyRegistrationDto = this.attorneyRegistrationMapper.toDto(
      // Null avatar to avoid uploading on every validation call.
      { ...registerData, avatar: null, attachedFiles: void 0 },
    );

    return this.http.post<AttorneyRegistrationDto>(this.attorneyValidationUrl, attorneyRegistrationDto, { params }).pipe(
      mapTo(null),
      catchError((httpError: HttpErrorResponse) => {
        const apiError = this.apiErrorMapper.fromDtoWithValidationSupport(httpError, this.attorneyRegistrationMapper);
        return of(apiError);
      }),
    );
  }

  /**
   * Register a user as an attorney.
   * @param registerData Registration data.
   */
  public registerAttorney(registerData: AttorneyRegistration, attachedFiles: File[]): Observable<AttorneyRegistration> {
    const avatarUrl$ = this.prepareAvatar(registerData.avatar);
    const attachedFiles$ = this.fileStorageService.uploadAttorneyRegistrationAttachments(
      attachedFiles,
    );

    return combineLatest([
      avatarUrl$,
      attachedFiles$,
    ]).pipe(
      map(([avatarUrl, fileUrls]) => ({
        ...registerData,
        avatar: avatarUrl,
        attachedFiles: fileUrls,
      })),
      switchMap((preparedRegisterData) => {
        const attorneyRegistrationDto = this.attorneyRegistrationMapper.toDto(
          preparedRegisterData,
        );
        return this.http.post<AttorneyRegistrationDto>(this.attorneyUsersUrl, attorneyRegistrationDto)
          .pipe(
            catchError((httpError: HttpErrorResponse) => {
              const apiError = this.apiErrorMapper.fromDtoWithValidationSupport(httpError, this.attorneyRegistrationMapper);
              return throwError(apiError);
            }),
            map(attorneyRegistrationData => this.attorneyRegistrationMapper.fromDto(attorneyRegistrationData)),
          );
      }),
    );
  }

  /**
   * Register staff user.
   * @param registerData Registration data.
   */
  public registerStaff(registerData: StaffRegistration): Observable<void> {
    const avatarUrl$ = this.prepareAvatar(registerData.avatar);

    return avatarUrl$
    .pipe(
      switchMap(avatarUrl => {
        const dto = this.staffRegistrationMapper.toDto({
          ...registerData,
          avatar: avatarUrl,
        });
        return this.http.post<ClientRegistrationDto>(this.staffUsersUrl, dto);
      }),
      catchError((httpError: HttpErrorResponse) => {
        const apiError = this.apiErrorMapper.fromDtoWithValidationSupport(httpError, this.staffRegistrationMapper);
        return throwError(apiError);
      }),
      mapTo(void 0),
    );
  }

  /**
   * Register a users as a client.
   * @param registerData Registration data.
   */
  public registerClient(registerData: ClientRegistration): Observable<Omit<ClientRegistration, 'password' | 'passwordConfirm'>> {
    const avatarUrl$ = this.prepareAvatar(registerData.avatar);

    return avatarUrl$
      .pipe(
        switchMap(avatarUrl => {
          registerData.avatar = avatarUrl; // Replace with uploaded file URL.
          const clientRegistrationDto = this.clientRegistrationMapper.toDto(registerData);
          return this.http.post<ClientRegistrationDto>(this.clientUsersUrl, clientRegistrationDto)
            .pipe(
              catchError((httpError: HttpErrorResponse) => {
                const apiError = this.apiErrorMapper.fromDtoWithValidationSupport(httpError, this.clientRegistrationMapper);
                return throwError(apiError);
              }),
              map(responseDto => this.clientRegistrationMapper.fromDto(responseDto)),
            );
        }),
      );
  }

  private prepareAvatar(avatar: string | File | null): Observable<string> {
    const avatarUrl$ = typeof avatar === 'string' || avatar == null
      ? of(avatar as string)
      : this.fileStorageService.uploadAvatar(avatar).pipe(first());

    return avatarUrl$;
  }
}

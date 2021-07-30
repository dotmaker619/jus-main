import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AttorneyDto } from '@jl/common/core/dto/attorney-dto';
import { ChangePasswordDto } from '@jl/common/core/dto/change-password-dto';
import { ClientDto } from '@jl/common/core/dto/client-dto';
import { extractErrorMessage, ValidationErrorDto } from '@jl/common/core/dto/validation-error-dto';
import { ApiErrorMapper } from '@jl/common/core/mappers/api-error.mapper';
import { AttorneyMapper } from '@jl/common/core/mappers/attorney.mapper';
import { ClientMapper } from '@jl/common/core/mappers/client.mapper';
import { ChangePassword } from '@jl/common/core/models';
import { TEntityValidationErrors } from '@jl/common/core/models/api-error';
import { Attorney } from '@jl/common/core/models/attorney';
import { Client } from '@jl/common/core/models/client';
import { Role } from '@jl/common/core/models/role';
import { User } from '@jl/common/core/models/user';
import { AppConfigService } from '@jl/common/core/services/app-config.service';
import { AuthService } from '@jl/common/core/services/auth.service';
import { FileStorageService } from '@jl/common/core/services/file-storage.service';
import { Observable, throwError, merge, Subject, of } from 'rxjs';
import { map, switchMap, shareReplay, catchError, mapTo, tap, first } from 'rxjs/operators';

import { StaffDto } from '../dto/staff-dto';
import { StaffMapper } from '../mappers/staff.mapper';
import { Staff } from '../models/staff';

/** Object with not uploaded avatar. */
type StaffData = Pick<Staff, 'firstName' | 'lastName' | 'description'> & {
  /** Avatar. */
  avatar: File | string;
};

function changePasswordValidationErrorFromDto(
  errorDto: ValidationErrorDto<ChangePasswordDto> | null | undefined,
): TEntityValidationErrors<ChangePassword> {
  if (errorDto) {
    return {
      currentPassword: extractErrorMessage(errorDto.old_password),
      newPassword: extractErrorMessage(errorDto.new_password1),
    };
  }

  return null;
}

// TODO (Viktor C.): Service requires refactoring, probably we should somehow divide logic for different roles.
/**
 * User service.
 */
@Injectable({
  providedIn: 'root',
})
export class CurrentUserService {
  private readonly baseUrl = this.appConfigService.apiUrl;
  private readonly clientUserUrl = new URL('users/clients/current/', this.baseUrl).toString();
  private readonly attorneyUserUrl = new URL('users/attorneys/current/', this.baseUrl).toString();
  private readonly staffUserUrl = new URL('users/support/current/', this.baseUrl).toString();
  private readonly changePasswordUrl = new URL('auth/password/change/', this.baseUrl).toString();
  private readonly apiErrorMapper = new ApiErrorMapper();

  /** Attorney change. */
  private readonly attorneyChange$ = new Subject<Attorney>();
  /** Logged person information. */
  private readonly clientChange$ = new Subject<Client>();
  /** Staff change. */
  private readonly staffChange$ = new Subject<Staff>();

  /**
   * Current user information.
   */
  public readonly currentUser$: Observable<User>;

  /**
   * @constructor
   *
   * @param appConfigService Service to fetch app configs.
   * @param authService Service for user authorization.
   * @param httpClient Client for api calls.
   * @param clientMapper Mapper for Client model.
   * @param attorneyMapper Mapper for Attorney model.
   * @param staffMapper Mapper for Staff model.
   * @param fileStorageService File storage service.
   */
  public constructor(
    private appConfigService: AppConfigService,
    private authService: AuthService,
    private httpClient: HttpClient,
    private clientMapper: ClientMapper,
    private attorneyMapper: AttorneyMapper,
    private staffMapper: StaffMapper,
    private fileStorageService: FileStorageService,
  ) {
    this.currentUser$ = this.authService.userType$
      .pipe(
        switchMap(role => {
          if (role === Role.Unauthorized) {
            return of(null);
          }
          return this.getCurrentUserInformation(role);
          },
        ),
        shareReplay({ bufferSize: 1, refCount: true }),
      );
  }

  private getCurrentUserInformation(role: Role): Observable<User> {
    switch (role) {
      case Role.Attorney:
        return this.getAttorneyUser();
      case Role.Client:
        return this.getClientUser();
      case Role.Staff:
        return this.getStaffUser();
    }
    throw new Error(`Unexpected role ${role}`);
  }

  /**
   * Get current attorney data.
   */
  public getCurrentAttorney(): Observable<Attorney> {
    return merge(
      this.getAttorneyUser(),
      this.attorneyChange$,
    );
  }

  /**
   * Get current client data.
   */
  public getCurrentClient(): Observable<Client> {
    return merge(
      this.getClientUser(),
      this.clientChange$,
    );
  }

  /**
   * Get current staff data.
   */
  public getCurrentStaff(): Observable<Staff> {
    return merge(
      this.getStaffUser(),
      this.staffChange$,
    );
  }

  /**
   * Obtain current staff user.
   */
  public getStaffUser(): Observable<Staff> {
    return this.authService.userType$
      .pipe(
        switchMap(role => {
          if (role !== Role.Staff) {
            return throwError(new Error('Current user is not a staff.'));
          }

          return this.httpClient.get<StaffDto>(this.staffUserUrl);
        }),
        map(staffInfo => this.staffMapper.fromDto(staffInfo)),
      );
  }

  /**
   * Fetch current attorney user information from server.
   *
   * @returns Attorney information or throw an error if current user is not an attorney.
   */
  public getAttorneyUser(): Observable<Attorney> {
    return this.authService.userType$
      .pipe(
        switchMap(role => {
          if (role !== Role.Attorney) {
            return throwError(new Error('Current user is not an attorney.'));
          }
          return this.httpClient.get<AttorneyDto>(this.attorneyUserUrl);
        }),
        map(attorneyInfo => this.attorneyMapper.fromDto(attorneyInfo)),
      );
  }

  /**
   * Fetch current client user information from server.
   *
   * @returns Client information or throw an error if current user is not a client.
   */
  public getClientUser(): Observable<Client> {
    return this.authService.userType$
      .pipe(
        switchMap(role => {
          if (role !== Role.Client) {
            return throwError(new Error('Current user is not a client.'));
          }
          return this.httpClient.get<ClientDto>(this.clientUserUrl);
        }),
        map(clientInfo => this.clientMapper.fromDto(clientInfo)),
      );
  }

  /**
   * Update attorney data.
   */
  public updateCurrentAttorney(attorney: Attorney): Observable<Attorney> {
    const avatarUrl$ = this.prepareAvatar(attorney.avatar);

    return avatarUrl$
      .pipe(
        switchMap(avatarUrl => {
          attorney.avatar = avatarUrl; // Replace with uploaded file URL.
          const attorneyDto = this.attorneyMapper.toDto(attorney);
          return this.httpClient.put<AttorneyDto>(this.attorneyUserUrl, attorneyDto)
            .pipe(
              catchError((httpError: HttpErrorResponse) => {
                const apiError = this.apiErrorMapper.fromDtoWithValidationSupport(httpError, this.attorneyMapper);
                return throwError(apiError);
              }),
              map(updatedAttorneyDto => this.attorneyMapper.fromDto(updatedAttorneyDto)),
              tap(updatedAttorney => this.attorneyChange$.next(updatedAttorney)),
            );
        }),
      );
  }

  /**
   * Update client data.
   */
  public updateClientUser(client: Client): Observable<Client> {
    const avatarUrl$ = this.prepareAvatar(client.avatar);

    return avatarUrl$
      .pipe(
        switchMap(avatarUrl => {
          client.avatar = avatarUrl; // Replace with uploaded file URL.
          const clientDto = this.clientMapper.toDto(client);
          return this.httpClient.put<ClientDto>(this.clientUserUrl, clientDto)
          .pipe(
            catchError((httpError: HttpErrorResponse) => {
              const apiError = this.apiErrorMapper.fromDtoWithValidationSupport(httpError, this.clientMapper);
              return throwError(apiError);
            }),
            map(updatedClientDto => this.clientMapper.fromDto(updatedClientDto)),
            tap(updatedClient => this.clientChange$.next(updatedClient)),
          );
        }),
      );
  }

  /**
   * Update client data.
   */
  public updateStaffUser(staff: StaffData): Observable<Staff> {
    const avatarUrl$ = this.prepareAvatar(staff.avatar);

    return avatarUrl$
      .pipe(
        switchMap(avatarUrl => {
          const dto = this.staffMapper.toDto({
            ...staff,
            avatar: avatarUrl,
          });
          return this.httpClient.patch<StaffDto>(this.staffUserUrl, dto)
          .pipe(
            catchError((httpError: HttpErrorResponse) => {
              const apiError = this.apiErrorMapper.fromDtoWithValidationSupport(httpError, this.staffMapper);
              return throwError(apiError);
            }),
            map(updatedClientDto => this.staffMapper.fromDto(updatedClientDto)),
            tap(updatedClient => this.staffChange$.next(updatedClient)),
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

  /**
   * Change password of current user.
   *
   * @param currentPassword Current password.
   * @param newPassword New password.
   */
  public changePassword(currentPassword: string, newPassword: string): Observable<void> {
    const body: ChangePasswordDto = {
      old_password: currentPassword,
      new_password1: newPassword,
      new_password2: newPassword,
    };
    return this.httpClient.post<ChangePasswordDto>(this.changePasswordUrl, body)
      .pipe(
        catchError((httpError: HttpErrorResponse) => {
          if (httpError.status === 400) {
            const apiError = changePasswordValidationErrorFromDto(httpError.error.data);
            return throwError(apiError);
          }
          return throwError(this.apiErrorMapper.fromDto(httpError));
        }),
        mapTo(null),
      );
  }
}

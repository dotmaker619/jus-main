import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApiErrorMapper } from '@jl/common/core/mappers/api-error.mapper';
import { ResetPasswordConfirmationMapper } from '@jl/common/core/mappers/reset-password-confirmation.mapper';
import { ResetPasswordMapper } from '@jl/common/core/mappers/reset-password.mapper';
import { Login } from '@jl/common/core/models/login';
import { ResetPassword } from '@jl/common/core/models/reset-password';
import { ResetPasswordConfirmation } from '@jl/common/core/models/reset-password-confirmation';
import { Role } from '@jl/common/core/models/role';
import { AppConfigService } from '@jl/common/core/services/app-config.service';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { AuthDataDto } from '../dto/auth-data-dto';
import { LoginMapper } from '../mappers/login.mapper';
import { AuthData } from '../models/auth-data';

/** Interface for reset password data */
interface ResetPasswordDetails {
  /** Message returned by the server */
  detail: string;
}

/** Authorization service */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly baseUrl = this.appConfigService.apiUrl;
  private readonly loginUrl = new URL('auth/login/', this.baseUrl).toString();
  private readonly resetPasswordUrl = new URL('auth/password/reset/', this.baseUrl).toString();
  private readonly resetPasswordConfirmationUrl = new URL('auth/password/reset/confirm/', this.baseUrl).toString();
  private readonly tokenKey = 'authToken';
  private readonly userTypeKey = 'authUserType';
  private token: string;
  private userType: Role;
  /** Stream for is authenticated */
  public isAuthenticated$ = new BehaviorSubject<boolean>(false);
  /** User type Observable */
  public userType$ = new BehaviorSubject<Role>(Role.Unauthorized);

  /**
   * @constructor
   * @param appConfigService
   * @param http
   * @param router
   * @param loginMapper
   * @param resetPasswordMapper
   * @param resetPasswordConfirmationMapper
   * @param apiErrorMapper
   */
  public constructor(
    private appConfigService: AppConfigService,
    private http: HttpClient,
    private router: Router,
    private loginMapper: LoginMapper,
    private resetPasswordMapper: ResetPasswordMapper,
    private resetPasswordConfirmationMapper: ResetPasswordConfirmationMapper,
    private apiErrorMapper: ApiErrorMapper,
  ) {
    this.retrieveToken();
  }

  /** Return auth token */
  public getAuthToken(): string {
    return this.token;
  }

  /** Store auth token in local storage */
  private saveToken(authData: AuthData): void {
    this.token = authData.key;
    this.userType = <Role>authData.role;
    localStorage.setItem(this.tokenKey, this.token);
    localStorage.setItem(this.userTypeKey, this.userType);
    this.isAuthenticated$.next(true);
    this.userType$.next(this.userType);
  }

  /** Retrieve token from local store if exists */
  private retrieveToken(): void {
    const token = localStorage.getItem(this.tokenKey);
    if (token) {
      this.token = token;
      this.userType = <Role>localStorage.getItem(this.userTypeKey);
      this.isAuthenticated$.next(true);
      this.userType$.next(this.userType);
    } else {
      this.token = '';
      this.isAuthenticated$.next(false);
    }
  }

  /** Check if token exists
   *
   * If no token exists in service, navigate user to login page.
   *
   * @param url to be used after successful login.
   */
  public requireLogin(redirectUrl: string): boolean {
    if (this.token) {
      return true;
    }

    this.router.navigate(['/auth/login'], { queryParams: { next: redirectUrl } });

    return false;
  }

  /** Authenticate user on backend
   *
   * Tries to authenticate user on backend. In case of success, user will be
   * redirected to the this.redirectUrl if it was set, otherwise user will be
   * redirected to the this.defaultRedirectUrl. Also, this.redirectUrl will be
   * cleared after success navigation.
   *
   * Nothing happens in case of bad API error though.
   *@param credentials Login credentials.
   */
  public login(credentials: Login): Observable<AuthData> {
    return this.http
      .post<AuthDataDto>(this.loginUrl, this.loginMapper.toDto(credentials))
      .pipe(
        map(authDataDto => this.loginMapper.fromDto(authDataDto)),
        tap(authData => this.saveToken(authData)),
        catchError((error: HttpErrorResponse) => {
          return throwError(error.error.detail);
        }),
      );
  }

  /** Reset user password */
  public resetPassword(credential: ResetPassword): Observable<string> {
    return this.http
      .post<ResetPasswordDetails>(this.resetPasswordUrl, this.resetPasswordMapper.toDto(credential))
      .pipe(
        map(resetPasswordData => resetPasswordData.detail),
        catchError((error: HttpErrorResponse) => {
          const apiError = this.apiErrorMapper.fromDtoWithValidationSupport(error, this.resetPasswordMapper);
          return throwError(apiError);
        }),
      );
  }

  /** Set new password for user */
  public resetPasswordConfirmation(credentials: ResetPasswordConfirmation): Observable<string> {
    return this.http
      .post<ResetPasswordDetails>(this.resetPasswordConfirmationUrl, this.resetPasswordConfirmationMapper.toDto(credentials))
      .pipe(
        catchError((httpError: HttpErrorResponse) => {
          const apiError = this.apiErrorMapper.fromDtoWithValidationSupport(httpError, this.resetPasswordConfirmationMapper);
          return throwError(apiError);
        }),
        map(resetPasswordData => resetPasswordData.detail),
      );
  }

  /** Clear login information of the user */
  public logout(): Observable<void> {
    // `of(null)` to emulate async action
    return of(null).pipe(
      tap(() => {
        localStorage.clear();
        this.token = null;
        this.isAuthenticated$.next(false);
        this.userType$.next(Role.Unauthorized);
      }),
    );
  }
}

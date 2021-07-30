import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PaginationDto } from '@jl/common/core/dto';
import { InviteDto } from '@jl/common/core/dto/invite-dto';
import { InviteMapper } from '@jl/common/core/mappers/invite.mapper';
import { Invite } from '@jl/common/core/models/invite';
import { AppConfigService } from '@jl/common/core/services/app-config.service';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ApiErrorMapper } from '../../mappers/api-error.mapper';

/** Service for working with invites API. */
@Injectable({
  providedIn: 'root',
})
export class InvitesService {
  private readonly invitesUrl = new URL('users/invites/', this.appConfig.apiUrl).toString();

  /**
   * @constructor
   * @param http
   * @param appConfig
   * @param inviteMapper
   * @param apiErrorMapper
   */
  public constructor(
    private http: HttpClient,
    private appConfig: AppConfigService,
    private inviteMapper: InviteMapper,
    private apiErrorMapper: ApiErrorMapper,
  ) { }

  /**
   * Get invites.
   */
  public getInvites(): Observable<Invite[]> {
    return this.http.get<PaginationDto<InviteDto>>(this.invitesUrl).pipe(
      map(({ results }) => results.map(invite => this.inviteMapper.fromDto(invite))),
    );
  }

  /**
   * Create new invite.
   * @param invite New invite.
   */
  public createInvite(invite: Invite): Observable<Invite> {
    return this.http.post<InviteDto>(this.invitesUrl, this.inviteMapper.toDto(invite)).pipe(
      catchError((httpError: HttpErrorResponse) => {
        const apiError = this.apiErrorMapper.fromDtoWithValidationSupport(httpError, this.inviteMapper);
        return throwError(apiError);
      }),
      map(createdInvite => this.inviteMapper.fromDto(createdInvite)),
    );
  }

  /**
   * Update invite.
   * @param invite Invite to update.
   */
  public updateInvite(invite: Invite): Observable<Invite> {
    const url = new URL(`${invite.uuid}/`, this.invitesUrl).toString();
    return this.http.put<InviteDto>(url, this.inviteMapper.toDto(invite)).pipe(
      map(updatedInvite => this.inviteMapper.fromDto(updatedInvite)),
    );
  }

  /**
   * Resend invite.
   * @param uuid Invite uuid.
  */
  public resendInvite(uuid: string): Observable<void> {
    const urlResend = new URL(`${uuid}/resend/`, this.invitesUrl).toString();

    return this.http.post<void>(urlResend, null);
  }

  /**
   * Get invited client data.
   * @param uuid Primary key of invitation.
   */
  public getInvitedClient(uuid: string): Observable<Invite> {
    return this.http.get<InviteDto>(`${this.invitesUrl}${uuid}`)
      .pipe(
        map(inviteDto => this.inviteMapper.fromDto(inviteDto)),
      );
  }
}

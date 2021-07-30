import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, combineLatest, throwError, timer } from 'rxjs';
import { mapTo, map, tap, startWith, switchMap, catchError } from 'rxjs/operators';

import { PaginationDto, ValidationErrorDto } from '../dto';
import { NetworkDto } from '../dto/network-dto';
import { ApiErrorMapper } from '../mappers/api-error.mapper';
import { ValidationErrorMapper } from '../mappers/mapper';
import { NetworkMapper } from '../mappers/network.mapper';
import { TEntityValidationErrors } from '../models/api-error';
import { Network } from '../models/network';
import { NetworkInvitation } from '../models/network-invitation';
import { Pagination } from '../models/pagination';
import { SearchParams } from '../models/search-params';

import { AppConfigService } from './app-config.service';
import { CurrentUserService } from './current-user.service';

/** Period for updating networks. */
const NETWORK_UPDATE_TIME = 10000;

interface NetworkInvitationDto {
  /** Ids of network participants. */
  participants: number[];
  /** Invitation message. */
  message: string;
}

class NetworkInvitationMapper implements ValidationErrorMapper<NetworkInvitationDto, NetworkInvitation> {
  /** @inheritdoc */
  public validationErrorFromDto(errorDto: ValidationErrorDto<NetworkInvitationDto>): TEntityValidationErrors<NetworkInvitation> {
    return {
      message: errorDto.message[0],
    };
  }
}

/** Group chats service. */
@Injectable({ providedIn: 'root' })
export class NetworksService {

  private readonly networksUrl: URL;
  private readonly networksUpdate$ = new Subject<void>();
  private readonly networkInvitationMapper = new NetworkInvitationMapper();
  /**
   * @constructor
   * @param httpClient Http client.
   * @param networkMapper Networks mapper.
   * @param userService User service.
   */
  public constructor(
    private readonly httpClient: HttpClient,
    private readonly networkMapper: NetworkMapper,
    private readonly userService: CurrentUserService,
    private readonly apiErrorMapper: ApiErrorMapper,
    appConfig: AppConfigService,
  ) {
    this.networksUrl = new URL('social/group-chats/', appConfig.apiUrl);
  }

  /**
   * Create group chat.
   * @param network Chat info.
   */
  public createNetwork(network: Network): Observable<void> {
    return this.httpClient.post<NetworkDto>(
      this.networksUrl.toString(),
      this.networkMapper.toDto(network),
    ).pipe(
      mapTo(null),
      tap(() => this.networksUpdate$.next()),
    );
  }

  /**
   * Get group chats.
   * @param param0 Search params.
   */
  public getNetworks({
    itemsPerPage: itemsPerPageOrNull, query, page,
  }: SearchParams = {}): Observable<Pagination<Network>> {
    const itemsPerPage = itemsPerPageOrNull || 100;
    const paginationOffset = (page || 0) * itemsPerPage;

    const params$ = this.userService.currentUser$.pipe(
      map(currentUser => {
        let params = new HttpParams({
          fromObject: {
            offset: paginationOffset.toString(),
            limit: itemsPerPage.toString(),
            participants: currentUser.id.toString(),
          },
        });

        if (query != null) {
          params = params.set('search', query);
        }
        return params;
      }),
    );

    return combineLatest([
      params$,
      this.networksUpdate$.pipe(startWith(null)),
      timer(0, NETWORK_UPDATE_TIME),
    ]).pipe(
      switchMap(([params]) => this.httpClient.get<PaginationDto<NetworkDto>>(
        this.networksUrl.toString(), { params },
      )),
      map(pagination => ({
        items: pagination.results.map(item => this.networkMapper.fromDto(item)),
        itemsCount: pagination.count,
        page,
        pagesCount: Math.ceil(pagination.count / itemsPerPage),
      }) as Pagination<Network>),
    );
  }

  /**
   * Get network by id.
   * @param id Network id.
   */
  public getNetworkById(id: number): Observable<Network> {
    const url = new URL(`${id}/`, this.networksUrl);
    return this.httpClient.get<NetworkDto>(
      url.toString(),
    ).pipe(
      map(dto => this.networkMapper.fromDto(dto)),
    );
  }

  /**
   * Leave network.
   * @param network Network to leave.
   */
  public leaveNetwork(network: Network): Observable<void> {
    const url = new URL(`${network.id}/leave/`, this.networksUrl);
    return this.httpClient.delete<void>(url.toString());
  }

  /**
   * Invite more people to a network.
   * @param network Network to invite people in.
   * @param invitation Invitation info.
   */
  public invitePeople(network: Network, invitation: NetworkInvitation): Observable<void> {
    const url = new URL(`${network.id}/add_participants/`, this.networksUrl);
    return this.httpClient.post<NetworkDto>(url.toString(), {
      participants: invitation.participants.map(u => u.id),
      message: invitation.message,
    } as NetworkInvitationDto).pipe(
      tap(() => this.networksUpdate$.next()),
      mapTo(null),
      catchError((error: HttpErrorResponse) => {
        const apiError = this.apiErrorMapper.fromDtoWithValidationSupport(error, this.networkInvitationMapper);
        return throwError(apiError);
      }),
    );

  }

  /**
   * Update network title.
   * @param network Network to rename.
   * @param title New title.
   */
  public updateNetworkName(network: Network, title: string): Observable<void> {
    const url = new URL(`${network.id}/`, this.networksUrl);
    return this.httpClient.patch<NetworkDto>(
      url.toString(),
      { title },
    ).pipe(
      mapTo(null),
      tap(() => this.networksUpdate$.next()),
    );
  }
}

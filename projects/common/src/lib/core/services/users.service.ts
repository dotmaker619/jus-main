import {
  HttpClient,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, } from 'rxjs';
import { map, mapTo } from 'rxjs/operators';

import { PaginationDto } from '../dto';
import { AttorneyDto } from '../dto/attorney-dto';
import { AuthorDto } from '../dto/author-dto';
import { ClientDto } from '../dto/client-dto';
import { AttorneyMapper } from '../mappers/attorney.mapper';
import { AuthorMapper } from '../mappers/author.mapper';
import { ClientMapper } from '../mappers/client.mapper';
import { Client } from '../models';
import { Attorney } from '../models/attorney';
import { Pagination } from '../models/pagination';
import { User } from '../models/user';

import { AppConfigService } from './app-config.service';

const DEFAULT_USER_PARAMS: Record<string, string> = {
  ordering: 'user__first_name',
};

/**
 * Users service.
 * Provides methods to work with users entities.
 */
@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly baseUrl = this.appConfig.apiUrl;
  private readonly usersUrl = new URL('users/', this.baseUrl).toString();
  private readonly attorneyUsersUrl = new URL('users/attorneys/', this.baseUrl).toString();
  private readonly clientUsersUrl = new URL('users/clients/', this.baseUrl).toString();
  private readonly clientMapper = new ClientMapper();
  private readonly attorneyMapper = new AttorneyMapper();
  private readonly authorMapper = new AuthorMapper();

  private readonly ATTORNEY_PER_PAGE = 20;

  /**
   * @constructor
   * @param http Http client.
   * @param appConfig Application config service.
   */
  public constructor(
    private http: HttpClient,
    private appConfig: AppConfigService,
  ) { }

  /**
   * Get users by their ids.
   * @param ids Ids of users.
   */
  public getUsersByIds(ids: number[]): Observable<User[]> {
    const limit = ids.length.toString();
    const idsStr = ids.join(',');

    const params = new HttpParams({
      fromObject: {
        limit,
        id__in: idsStr,
      },
    });

    return this.http.get<PaginationDto<AuthorDto>>(this.usersUrl, { params }).pipe(
      map(({ results }) => results.map(user => this.authorMapper.fromDto(user))),
      map(authors => authors.map(author => new User(author))),
    );
  }

  /** Get clients. */
  public getClients(): Observable<Client[]> {
    const params = new HttpParams({
      fromObject: {
        'user_clients': 'true',
        ...DEFAULT_USER_PARAMS,
      },
    });

    return this.http.get<PaginationDto<ClientDto>>(this.clientUsersUrl, { params }).pipe(
      map(pagination => pagination.results),
      map(results => results.map(client => this.clientMapper.fromDto(client))),
    );
  }

  /** Get clients who have leads with current attorney. */
  public getClientsForAttorney(): Observable<Client[]> {
    const params = new HttpParams({
      fromObject: {
        'user_clients': 'true',
        ...DEFAULT_USER_PARAMS,
      },
    });

    return this.http.get<PaginationDto<ClientDto>>(this.clientUsersUrl, { params }).pipe(
      map(({ results }) => results.map(client => this.clientMapper.fromDto(client))),
    );
  }

  /** Get clients who have leads with current attorney. */
  public getClientsWithMatters(): Observable<Client[]> {
    const params = new HttpParams({
      fromObject: {
        'has_matter_with_user': 'true',
        ...DEFAULT_USER_PARAMS,
      },
    });

    return this.http.get<PaginationDto<ClientDto>>(this.clientUsersUrl, { params }).pipe(
      map(({ results }) => results.map(client => this.clientMapper.fromDto(client))),
    );
  }

  /**
   * Get attorneys.
   */
  public getAttorneys(): Observable<Attorney[]> {
    return this.http.get<PaginationDto<AttorneyDto>>(this.attorneyUsersUrl).pipe(
      map(pagination => pagination.results.map(client => this.attorneyMapper.fromDto(client))),
    );
  }

  /**
   * Fetch client user information from server.
   *
   * @param id Cleint's ID.
   */
  public getClient(id: number | string): Observable<Client> {
    const url = new URL(`${id}/`, this.clientUsersUrl).toString();
    return this.http
      .get<ClientDto>(url)
      .pipe(
        map(clientInfo => this.clientMapper.fromDto(clientInfo)),
      );
  }

  /**
   * Fetch attorney user information from server
   *
   * @param id Attorney's ID.
   */
  public getAttorneyById(id: number | string): Observable<Attorney> {
    const url = new URL(`${id}/`, this.attorneyUsersUrl).toString();
    return this.http
      .get<AttorneyDto>(url)
      .pipe(
        map(attorneyInfo => this.attorneyMapper.fromDto(attorneyInfo)),
      );
  }

  /** Return followed attorneys for current user */
  public followedAttorneys(): Observable<Pagination<Attorney>> {
    const params = new HttpParams().set('followed', 'true');

    return this.http
      .get<PaginationDto<AttorneyDto>>(this.attorneyUsersUrl, { params })
      .pipe(
        map(pagination => {
          return {
            items: pagination.results.map(attorney => this.attorneyMapper.fromDto(attorney)),
            itemsCount: pagination.count,
            pagesCount: Math.ceil(pagination.count / this.ATTORNEY_PER_PAGE),
          } as Pagination<Attorney>;
        }),
      );
  }

  /** Unfollow passed attorney */
  public unfollowAttorney(attorneyId: number): Observable<boolean> {
    const unfollowUrl = new URL(`${attorneyId}/unfollow/`, this.attorneyUsersUrl).toString();
    return this.http.post(unfollowUrl, {}).pipe(mapTo(true));
  }
}

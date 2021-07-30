import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PaginationDto } from '@jl/common/core/dto';
import { MatterDto } from '@jl/common/core/dto/matter-dto';
import { ApiErrorMapper } from '@jl/common/core/mappers/api-error.mapper';
import { MatterMapper } from '@jl/common/core/mappers/matter.mapper';
import { Matter } from '@jl/common/core/models/matter';
import { FileStorageService } from '@jl/common/core/services/file-storage.service';
import { Observable, throwError, of, timer } from 'rxjs';
import { map, switchMap, catchError, mapTo, pluck, tap, first } from 'rxjs/operators';

import { AuthorDto } from '../../dto/author-dto';
import { ReferMatterMapper } from '../../mappers/refer-matter.mapper';
import { JusLawFile } from '../../models/juslaw-file';
import { MatterStatus } from '../../models/matter-status';
import { ReferMatter } from '../../models/refer-matter';
import { User } from '../../models/user';
import { AppConfigService } from '../app-config.service';
import { CallsService } from '../calls.service';
import { CurrentUserService } from '../current-user.service';

const matterStatusActionMap: Record<MatterStatus, string> = {
  [MatterStatus.Active]: 'activate',
  [MatterStatus.Completed]: 'complete',
  [MatterStatus.Pending]: 'pending',
  [MatterStatus.Draft]: 'draft',
  [MatterStatus.Revoked]: 'revoke',
};

interface IMattersFilterOptions {
  /** Ordering. */
  order?: string;
  /** Status */
  statuses?: MatterStatus[];
  /** Client id. */
  client?: number;
  /** Rate type. */
  rateType?: Matter['rateType'];
}

/** Refer */
interface ReferMatterInfoDto {
  /** Id. */
  readonly id: number;
  /** User id. */
  readonly user: number;
  /** User data. */
  readonly user_data: AuthorDto;
  /** Matter id. */
  readonly matter: number;
  /** Matter data. */
  readonly matter_data: Pick<Matter, 'id' | 'code' | 'title' | 'description'>;
}

/**
 * Timeout between re-request "matters" to display actual information of status without reload a page.
 */
const REFRESH_MATTERS_TIMEOUT = 10 * 1000; // 10 seconds.

/** MattersService. */
@Injectable({
  providedIn: 'root',
})
export class MattersService {

  private readonly mattersUrl = new URL('business/matters/', this.appConfig.apiUrl).toString();
  private readonly referMatterInfoUrl = new URL('business/matter-shared-with/', this.appConfig.apiUrl).toString();
  /**
   * @constructor
   * @param http Http client.
   * @param matterMapper Matter mapper.
   * @param fileStorageService File storage service.
   * @param apiErrorMapper Api error mapper.
   * @param appConfig App config.
   * @param referMatterMapper Refer matter mapper.
   * @param userService User service.
   * @param callsService Calls service.
   */
  public constructor(
    private readonly http: HttpClient,
    private readonly matterMapper: MatterMapper,
    private readonly fileStorageService: FileStorageService,
    private readonly apiErrorMapper: ApiErrorMapper,
    private readonly appConfig: AppConfigService,
    private readonly referMatterMapper: ReferMatterMapper,
    private readonly userService: CurrentUserService,
    private readonly callsService: CallsService,
  ) { }
  /**
   * Get matters
   * @param order - sort order
   */
  public getMatters({ client, order, statuses, rateType }: IMattersFilterOptions = {}): Observable<Matter[]> {

    let params = new HttpParams();

    if (order != null) {
      params = params.set('ordering', order);
    }

    if (statuses != null) {
      params = params.set('status__in', `${statuses.join(',')}`);
    }

    if (client != null) {
      params = params.set('client', client.toString());
    }

    if (rateType != null) {
      params = params.set('rate_type', rateType);
    }

    // Get updated info every REFRESH_MATTERS_TIMEOUT ms.
    return timer(0, REFRESH_MATTERS_TIMEOUT)
      .pipe(
        switchMap(() => {
          return this.http.get<PaginationDto<MatterDto>>(this.mattersUrl, { params }).pipe(
            map(({ results }) => results.map(matter => this.matterMapper.fromDto(matter))),
          );
        }),
      );
  }

  /**
   * Save matter.
   * @description Create a new if ID is null otherwise update existing.
   * @param matter Matter to save.
   */
  public saveMatter(matter: Matter): Observable<Matter> {
    const filesToUpload = matter.documents.filter(doc => doc.isLocalFile)
      .map(document => document.file as File);
    const existingDocuments = matter.documents.filter(doc => !doc.isLocalFile);

    const newDocumentsUrls$ = filesToUpload.length === 0
      ? of([])
      : this.fileStorageService.uploadForEsign(filesToUpload);

    return newDocumentsUrls$.pipe(
      switchMap(newDocumentsUrls => {
        if (newDocumentsUrls.length === 0) {
          // There are not new documents. It means we should not re-create DocuSign envelop.
          matter.documents = [];
        } else {
          // We have new documents => we should merge old and new and send it with a matter.
          const newDocuments = newDocumentsUrls.map((fileUrl, index) => {
            return new JusLawFile({
              name: filesToUpload[index].name,
              file: fileUrl,
            });
          });
          matter.documents = [
            ...existingDocuments,
            ...newDocuments,
          ];
        }
        if (matter.id == null) {
          // This is creation of new matter.
          const body = this.matterMapper.toDto(matter);
          return this.http.post<MatterDto>(this.mattersUrl, body)
            .pipe(
              catchError((httpError: HttpErrorResponse) => {
                const apiError = this.apiErrorMapper.fromDtoWithValidationSupport(httpError, this.matterMapper);
                return throwError(apiError);
              }),
              map(matterDto => this.matterMapper.fromDto(matterDto)),
            );
        }
        return this.patchMatter(matter);
      }),
    );
  }

  /**
   * Set status for matter.
   * @param matter
   * @param status
   */
  public setMatterStatus(matter: Matter, status: MatterStatus): Observable<void> {

    const url = new URL(`${matter.id}/${matterStatusActionMap[status]}/`, this.mattersUrl).toString();
    return this.http.post(url, this.matterMapper.toDto(matter)).pipe(map(() => null));
  }

  /**
   * Get matter by id
   * @param id
   */
  public getMatterById(id: number): Observable<Matter> {
    // Get updated info every REFRESH_MATTERS_TIMEOUT ms.
    return timer(0, REFRESH_MATTERS_TIMEOUT)
      .pipe(
        switchMap(() => {
          return this.http.get<MatterDto>(`${this.mattersUrl}${id}/`).pipe(
            map((matter) => this.matterMapper.fromDto(matter)),
          );
        }),
      );
  }

  /**
   * Update matter stage.
   * @param matter
   * @param stageId
   */
  public updateMatterStage(matter: Matter, stageId: number): Observable<Matter> {
    const newMatter = { id: matter.id, stage: { id: stageId } } as Matter;

    return this.patchMatter(newMatter);
  }

  /**
   * Obtain id of a shared matter.
   * @param id Id.
   */
  public getMatterIdByReferMatterId(id: number): Observable<number> {
    return this.http.get<ReferMatterInfoDto>(
      `${this.referMatterInfoUrl}${id}/`,
    ).pipe(
      pluck('matter'),
    );
  }

  /**
   * Refer matter.
   *
   * @param referMatterData Refer matter data.
   * @param matter Matter details.
   */
  public referMatter(referMatterData: ReferMatter, matter: Matter): Observable<void> {

    const body$ = this.userService.currentUser$.pipe(
      map((user) => this.adjustReferDataWithCurrentUser(referMatterData, matter, user.id)),
      map(this.referMatterMapper.toDto),
    );

    return body$.pipe(
      switchMap((body) => this.http.post<MatterDto>(`${this.mattersUrl}${referMatterData.id}/share/`, body)),
      catchError((httpError: HttpErrorResponse) => {
        const apiError = this.apiErrorMapper.fromDtoWithValidationSupport(httpError, this.referMatterMapper);
        return throwError(apiError);
      }),
      mapTo(null),
    );
  }

  /**
   * Initiate call between participants.
   * @param participants Users are in a call.
   */
  public initiateCallForMatter(participants: User[]): Observable<void> {
    return this.callsService.initiateVideoCallWith(participants).pipe(
      first(),
      tap((call) => this.callsService.proceedToCall(call)),
      mapTo(void 0),
    );
  }

  /**
   * Updates matter properties.
   * @param matter
   */
  private patchMatter(matter: Matter): Observable<Matter> {
    return this.http.patch<MatterDto>(`${this.mattersUrl}${matter.id}/`, this.matterMapper.toDto(matter)).pipe(
      catchError((httpError: HttpErrorResponse) => {
        const apiError = this.apiErrorMapper.fromDtoWithValidationSupport(httpError, this.matterMapper);
        return throwError(apiError);
      }),
      map(matterDto => this.matterMapper.fromDto(matterDto)),
    );
  }

  /**
   * Add current user in refer data object if matter is shared, otherwise return the same referMatterData
   *
   * @param referMatterData Refer matter data.
   * @param matter Matter
   * @param userId User id.
   *
   * @description
   * If the matter is already shared with the current user we don't want to display the current user in the list.
   * To reach that we filter the list before show it to users.
   * But when we make a request, we have to put id of the current user in the body,
   *  otherwise, it will be removed from the existing shared list.
   * It's a bit weird case but that's how API works.
   */
  private adjustReferDataWithCurrentUser(referMatterData: ReferMatter, matter: Matter, userId: number): ReferMatter {
    if (!matter.isSharedWithCurrentUser) {
      return referMatterData;
    }
    const users = Array.from(referMatterData.users);
    users.push(userId);
    return new ReferMatter({
      ...referMatterData,
      users,
    });
  }
}

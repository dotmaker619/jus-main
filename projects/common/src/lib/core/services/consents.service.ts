import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, Subject } from 'rxjs';
import { map, switchMap, catchError, mapTo, startWith, switchMapTo, tap } from 'rxjs/operators';

import { PaginationDto } from '../dto';
import { VoiceConsentDto } from '../dto/voice-consent-dto';
import { VoiceConsentMapper } from '../mappers/voice-consent.mapper';
import { Pagination } from '../models/pagination';
import { VoiceConsent } from '../models/voice-consent';
import { getFileExtension } from '../utils/file-extension';

import { AppConfigService } from './app-config.service';
import { FileStorageService } from './file-storage.service';
import { FileService } from './file.service';

/** Matter consents service. Provides functionality to upload, remove, download consents. */
@Injectable({ providedIn: 'root' })
export class ConsentsService {
  private readonly consentsUrl = new URL('business/voice-consent/', this.appConfig.apiUrl).toString();
  private readonly change$ = new Subject<void>();

  /**
   * @constructor
   * @param fileStorageService File storage service.
   * @param voiceConsentMapper Voice consent mapper.
   * @param fileService File service.
   * @param httpClient Http client.
   * @param appConfig App config.
   */
  public constructor(
    private readonly voiceConsentMapper: VoiceConsentMapper,
    private readonly fileStorageService: FileStorageService,
    private readonly fileService: FileService,
    private readonly http: HttpClient,
    private readonly appConfig: AppConfigService,
  ) { }

  /**
   * Get voice consents by matter id.
   * @param matterId Matter id.
   */
  public getVoiceConsentsByMatterId(matterId: number): Observable<Pagination<VoiceConsent<string>>> {
    const params = new HttpParams({
      fromObject: {
        matter: matterId.toString(),
        ordering: '-created',
      },
    });
    const consentsData$ = this.change$.pipe(
      startWith(null),
      switchMapTo(this.http.get<PaginationDto<VoiceConsentDto>>(this.consentsUrl, { params })),
    );

    return consentsData$.pipe(
      map((pagination) => {
        const items = pagination.results.map(c => this.voiceConsentMapper.fromDto(c));
        return {
          items,
          itemsCount: pagination.count,
        } as Pagination<VoiceConsent<string>>;
      }),
    );
  }

  /**
   * Upload voice consent for a matter.
   * @param matterId Matter id.
   * @param audio Consent audio.
   * @param title Record name.
   */
  public uploadVoiceConsentForMatter(matterId: number, audio: Blob, title: string): Observable<void> {
    const fileName = `${title}.${getFileExtension(audio)}`;
    return this.fileStorageService.uploadVoiceConsent(audio, fileName).pipe(
      switchMap(fileUrl =>
        this.http.post<VoiceConsentDto>(this.consentsUrl, {
          file: fileUrl,
          matter: matterId,
          title: title,
        } as VoiceConsentDto)),
      tap(() => this.change$.next()),
      catchError((res: HttpErrorResponse) => {
        const message = res.error && res.error.detail;
        return throwError(new Error(message));
      }),
      mapTo(null),
    );
  }

  /** Download voice consent. */
  public downloadVoiceConsent(consent: VoiceConsent<string>): void {
    const fileName = consent.file.substr(consent.file.lastIndexOf('/') + 1);
    this.fileService.downloadFile(consent.file, fileName);
  }

  /**
   * Delete voice consent.
   * @param id Id of a voice consent.
   */
  public deleteVoiceConsent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.consentsUrl}/${id}`).pipe(
      tap(() => this.change$.next()),
    );
  }
}

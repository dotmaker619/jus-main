import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError, Subject, timer, EMPTY } from 'rxjs';
import { map, switchMap, mapTo, catchError, switchMapTo, tap, shareReplay, startWith, filter } from 'rxjs/operators';

import { ESignEnvelopeDto } from '../dto/esign-envelop-dto';
import { ESignProfileDto } from '../dto/esign-profile-dto';
import { ESignEnvelopMapper } from '../mappers/esign-envelop.mapper';
import { ESignProfileMapper } from '../mappers/esign-profile.mapper';
import { ESignDocument } from '../models/esign-document';
import { ESignEnvelop } from '../models/esign-envelop';
import { ESignProfile } from '../models/esign-profile';
import { Role } from '../models/role';

import { AppConfigService } from './app-config.service';
import { CurrentUserService } from './current-user.service';
import { FileStorageService } from './file-storage.service';
import { UrlsService } from './urls.service';

const ESIGN_LINK_TIMEOUT = 180 * 1000; // 3 minutes
const ROLES_W_ESIGN = [Role.Attorney];

/**
 * Electronic signature service.
 */
@Injectable({
  providedIn: 'root',
})
export class ESignService {
  private readonly eSignProfileUrl = new URL('esign/profiles/current/', this.appConfig.apiUrl).toString();
  private readonly eSignEnvelopesUrl = new URL('esign/envelopes/', this.appConfig.apiUrl).toString();
  private readonly eSignProfileMapper = new ESignProfileMapper();
  private readonly eSignEnvelopMapper = new ESignEnvelopMapper();
  private readonly profileUpdated$ = new Subject<void>();
  /**
   * @constructor
   * @param appConfig Application config service.
   * @param httpClient Angular HTTP client.
   * @param router Router.
   * @param fileStorageService File storage service.
   * @param urlsService Urls service.
   * @param currentUserService User service.
   */
  public constructor(
    private readonly appConfig: AppConfigService,
    private readonly httpClient: HttpClient,
    private readonly router: Router,
    private readonly fileStorageService: FileStorageService,
    private readonly urlsService: UrlsService,
    private readonly currentUserService: CurrentUserService,
  ) { }

  /**
   * Fetch current ESign profile to process obtaining impersonation consent.
   *
   * @returns Attorney's e-signature profile.
   */
  public getESignProfile(returnUrl?: string): Observable<ESignProfile | never> {
    let params = new HttpParams();

    if (returnUrl) {
      params = params.set('return_url', returnUrl);
    }

    const esignRequest$ = this.httpClient.get<ESignProfileDto>(this.eSignProfileUrl, { params })
      .pipe(
        map(profileDto => this.eSignProfileMapper.fromDto(profileDto)),
      );

    /**
     * Update link every `ESIGN_LINK_TIMEOUT` to avoid issues with broken link
     * It seems that our backend has a timeout for ESign link.
     */
    const esignChange$ = timer(0, ESIGN_LINK_TIMEOUT).pipe(
      switchMapTo(esignRequest$),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );

    return this.currentUserService.currentUser$.pipe(
      filter(user => user != null),
      switchMap(({role}) => ROLES_W_ESIGN.includes(role) ? esignChange$ : EMPTY),
    );
  }

  /**
   * Get e-sign envelop by ID.
   * @param id Envelop ID.
   * @param redirectUrl URL to redirect after finish actions on resource that provided with envelop edit link.
   */
  public getESignEnvelop(id: number, redirectUrl: string): Observable<ESignEnvelop> {
    const url = new URL(`${id}/`, this.eSignEnvelopesUrl).toString();
    const params = new HttpParams({
      fromObject: {
        return_url: redirectUrl,
      },
    });
    return this.httpClient.get<ESignEnvelopeDto>(url, { params })
      .pipe(
        map(envelopDto => this.eSignEnvelopMapper.fromDto(envelopDto)),
      );
  }

  /**
   * Create envelope for matter documents and send it to e-sign.
   * @param files Files to upload.
   * @param matterId Matter id.
   */
  public sendMatterDocsToESign(files: File[], matterId: number): Observable<ESignEnvelop> {

    const params = new HttpParams({
      fromObject: {
        return_url: this.urlsService.getCurrentApplicationStateUrl(),
      },
    });

    return this.fileStorageService.uploadForEsign(files).pipe(
      switchMap((fileUrls) => {

        const envelop = new ESignEnvelop({
          documents: fileUrls.map(fileUrl => new ESignDocument({ fileUrl })),
          type: 'extra',
          matterId,
        });

        return this.httpClient.post<ESignEnvelopeDto>(this.eSignEnvelopesUrl, this.eSignEnvelopMapper.toDto(envelop), { params });
      }),
      map((envelopeDto) => this.eSignEnvelopMapper.fromDto(envelopeDto)),
      catchError((response: HttpErrorResponse) => throwError(response.error.detail)),
    );
  }

  /** Return impersonation consent of current user to use e-signature provider on behalf of a user */
  public isConsentProvided(): Observable<boolean> {
    return this.profileUpdated$.pipe(
      startWith(null),
      switchMapTo(this.getESignProfile()),
      map(profile => profile.hasConsent),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
  }

  /**
   * Navigate to page for obtaining e-signature impersonation consent.
   *
   * When an application authenticates to perform actions on behalf of a
   * user (impersonalized), that user will be asked to grant consent for
   * the set of scopes (sets of permissions) that the application has requested
   *
   * @param returnUrl to be used for return after completing obtaining consent process
   * by e-signature platform.
   */
  public obtainConsent(returnUrl: string): void {
    this.router.navigate(['esign/consent'], { queryParams: { returnUrl: returnUrl } });
  }

  /** Reset current esign profile. */
  public resetEsignProfile(): Observable<void> {
    return this.httpClient.delete<void>(this.eSignProfileUrl).pipe(
      tap(() => this.profileUpdated$.next()),
      mapTo(null),
    );
  }
}

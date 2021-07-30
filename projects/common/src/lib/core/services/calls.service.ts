import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { InAppBrowserService } from '@jl/common/mobile/services/in-app-browser.service';
import { Observable } from 'rxjs';
import { map, first, switchMap, withLatestFrom } from 'rxjs/operators';

import { CallInfoDto } from '../dto/call-info-dto';
import { CallInfoMapper } from '../mappers/call-info.mapper';
import { CallInfo } from '../models/call-info';
import { User } from '../models/user';

import { AppConfigService } from './app-config.service';
import { CurrentUserService } from './current-user.service';
import { PlatformService } from './platform.service';

/** Calls service. */
@Injectable({
  providedIn: 'root',
})
export class CallsService {
  /** Video call url. */
  public readonly videoCallUrl = `${this.appConfig.apiUrl}business/video-calls/`;

  /**
   * @constructor
   * @param appConfig App config.
   * @param httpClient Http client.
   * @param callInfoMapper Mapper.
   * @param userService User service.
   * @param platformService Platform service.
   * @param inAppService Service to work with browser within the app.
   */
  public constructor(
    private readonly appConfig: AppConfigService,
    private readonly httpClient: HttpClient,
    private readonly callInfoMapper: CallInfoMapper,
    private readonly userService: CurrentUserService,
    private readonly platformService: PlatformService,
    private readonly inAppService: InAppBrowserService,
  ) { }

  /**
   * Initiate video call and get info.
   * @param participants Call participants.
   */
  public initiateVideoCallWith(participants: User | User[]): Observable<CallInfo> {
    const participantsArr =
      participants instanceof Array ? participants : [participants];
    const currentUser$ = this.userService.currentUser$.pipe(
      first(),
    );

    const participantsIds$ = currentUser$.pipe(
      first(),
      map(curUser =>
        participantsArr
          // Make sure the participants array doesn't include current user.
          .filter(({id}) => id !== curUser.id)
          /**
           * Filtering participants with same roles because the API does not allow
           *  to initiate call with users who has the same role.
           */
          .filter(({role}) => role !== curUser.role)
          .map(u => u.id),
      ),
    );
    return participantsIds$.pipe(
      switchMap(ids =>
        this.httpClient.post<CallInfoDto>(this.videoCallUrl,
          {
            participants: ids,
          } as CallInfoDto,
        ),
      ),
      withLatestFrom(this.userService.currentUser$),
      map(([callDto, user]) => this.callInfoMapper.fromDto({
        ...callDto,
        caller: callDto.participants_data.find(p => user.id === p.id),
      })),
    );
  }

  /**
   * Open call source.
   * @param callInfo Call info.
   */
  public proceedToCall(callInfo: CallInfo): void {
    if (this.platformService.isWeb) {
      const link = document.createElement('a');
      link.href = callInfo.callUrl;
      link.target = '_blank';
      link.click();
      link.remove();
    } else {
      this.inAppService.openLink(callInfo.callUrl);
    }
  }

  /**
   * Get call info by call id.
   * @param id Id.
   */
  public getCallInfoById(id: number): Observable<CallInfo> {
    const url = `${this.videoCallUrl}${id}/`;
    return this.httpClient.get<CallInfoDto>(url).pipe(
      withLatestFrom(this.userService.currentUser$),
      map(([data, currentUser]) =>
        this.callInfoMapper.fromDto({
          ...data,
          /**
           * Assuming that first participant that is not
           *  current user - is a caller.
           */
          caller: data.participants_data.find(
            p => p.id !== currentUser.id,
          ),
        })),
    );
  }
}

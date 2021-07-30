import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {FollowDto} from '@jl/common/core/dto/follow-dto';
import {FollowMapper} from '@jl/common/core/mappers/follow.mapper';
import {Follow} from '@jl/common/core/models/follow';
import {AppConfigService} from '@jl/common/core/services/app-config.service';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

/** Service to manage followings */
@Injectable({
  providedIn: 'root',
})
export class FollowService {
  private readonly baseUrl = this.appConfig.apiUrl;
  private readonly followUrl = new URL('forum/followed/', this.baseUrl).toString();

  /**
   * @constructor
   * @param http
   * @param appConfig
   * @param followMapper
   */
  public constructor(
    private http: HttpClient,
    private appConfig: AppConfigService,
    private followMapper: FollowMapper,
  ) {}

  /**
   * Follow user to topic.
   * @param follow - follow data
   */
  public followTopic(follow: Follow): Observable<Follow> {
    return this.http
      .post<FollowDto>(this.followUrl, this.followMapper.toDto(follow))
      .pipe(
        map(data => this.followMapper.fromDto(data)),
      );
  }

  /**
   * Unfollow user from topic
   * @param followId - id of the follow object
   */
  public unfollowTopic(followId: number): Observable<boolean> {
    return this.http
      .delete(new URL(`${followId}/`, this.followUrl).toString())
      .pipe(
        map(data => true),
      );
  }
}

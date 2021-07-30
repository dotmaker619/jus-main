import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, combineLatest, of } from 'rxjs';
import { map, first, switchMap } from 'rxjs/operators';

import { PaginationDto } from '../../dto';
import { MatterPostDto } from '../../dto/matter-post-dto';
import { MatterPostMapper } from '../../mappers/matter-post.mapper';
import { MatterPost } from '../../models/matter-post';
import { AppConfigService } from '../app-config.service';
import { CurrentUserService } from '../current-user.service';

/** Matter post service. */
@Injectable({ providedIn: 'root' })
export class MatterPostService {
  private readonly baseUrl = this.appConfig.apiUrl;
  private readonly matterPostUrl = new URL('business/matter-post/', this.baseUrl).toString();

  /** @constructor */
  public constructor(
    private http: HttpClient,
    private appConfig: AppConfigService,
    private matterPostMapper: MatterPostMapper,
    private userService: CurrentUserService,
  ) { }

  /** Get matter posts. */
  public getMatterPosts(topicId: number): Observable<MatterPost[]> {
    const limit = 1000;
    const params = (new HttpParams())
      .set('ordering', 'created')
      .set('limit', limit.toString())
      .set('topic', topicId.toString());

    const request = this.http.get<PaginationDto<MatterPostDto>>(this.matterPostUrl, { params })
      .pipe(
        map(({ results }) => results),
      );

    return combineLatest([
      request,
      this.userService.currentUser$,
    ])
      .pipe(
        first(),
        map(([results, user]) =>
          results.map(dto => {
            const post = this.matterPostMapper.fromDto(dto);
            post.isMyPost = post.author.id === user.id;
            return post;
          }),
        ),
      );
  }

  /** Create matter post. */
  public createMatterPost(topicId: number, text: string): Observable<MatterPost> {
    return this.http.post<MatterPostDto>(this.matterPostUrl, { topic: topicId, text })
      .pipe(
        first(),
        map(dto => this.matterPostMapper.fromDto(dto)),
      );
  }

  /** Get matter post by id. */
  public getMatterPostById(id: number): Observable<MatterPost> {
    const url = `${this.matterPostUrl}/${id}/`;

    return this.http.get<MatterPostDto>(url).pipe(
      map(matterPost => this.matterPostMapper.fromDto(matterPost)),
    );
  }
}

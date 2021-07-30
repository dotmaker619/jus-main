import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, mapTo } from 'rxjs/operators';

import { PaginationDto } from '../dto';
import { SocialPostDto } from '../dto/social-post-dto';
import { SocialPostMapper } from '../mappers/social-post-mapper';
import { Pagination } from '../models/pagination';
import { SocialPost } from '../models/social-post';

import { AppConfigService } from './app-config.service';
import { FileStorageService } from './file-storage.service';

const POSTS_PER_PAGE = 10;

/**
 * Social service.
 */
@Injectable({ providedIn: 'root' })
export class SocialService {
  private readonly postsUrl: string;

  /**
   * @constructor
   *
   * @param appConfig App config.
   * @param http Http client.
   * @param socialPostMapper Social post mapper.
   */
  public constructor(
    appConfig: AppConfigService,
    private readonly http: HttpClient,
    private readonly socialPostMapper: SocialPostMapper,
    private readonly fileStorageService: FileStorageService,
  ) {
    this.postsUrl = `${appConfig.apiUrl}social/posts/`;
  }

  /**
   * Get posts.
   *
   * @param page Page number.
   */
  public getPosts(page: number = 0): Observable<Pagination<SocialPost>> {
    const params = new HttpParams()
      .set('limit', POSTS_PER_PAGE.toString())
      .set('offset', (page * POSTS_PER_PAGE).toString())
      .set('ordering', '-created');
    return this.http.get<PaginationDto<SocialPostDto>>(this.postsUrl, { params }).pipe(
      map(pagination => {
        return {
          itemsCount: pagination.count,
          pagesCount: Math.ceil(pagination.count / POSTS_PER_PAGE),
          items: pagination.results.map((postDto) => this.socialPostMapper.fromDto(postDto)),
        } as Pagination<SocialPost>;
      }),
    );
  }

  /**
   * Get post by id.
   *
   * @param id Post id.
   */
  public getPost(id: number | string): Observable<SocialPost> {
    const url = new URL(id.toString(), this.postsUrl);
    return this.http.get<SocialPostDto>(url.toString()).pipe(
      map((dto) => this.socialPostMapper.fromDto(dto)),
    );
  }

  /**
   * Save/edit social post.
   * @param post Social post data.
   */
  public savePost(post: SocialPost): Observable<void> {
    const body = this.socialPostMapper.toDto(post);

    const request$ = post.id
      ? this.http.patch(`${this.postsUrl}${post.id}/`, body)
      : this.http.post(this.postsUrl, body);

    return request$.pipe(mapTo(null));
  }

  /**
   * Delete post by id.
   *
   * @param id Post id.
   */
  public deletePost(id: number | string): Observable<void> {
    const url = new URL(`${id}/`, this.postsUrl);
    return this.http.delete(url.toString()).pipe(
      mapTo(null),
    );
  }

  /**
   * Prepare image for uploading to our server.
   *
   * @param image Image link or file.
   *
   * @description
   * When users edit a social post they may not change image.
   * In this case image is a URL and we don't want to do anything with it, just send it to API.
   * In case the image is a file we upload it to S3 before.
   */
  public prepareImageForPost(image: string | File): Observable<string> {
    return typeof image === 'string'
      ? of(image)
      : this.fileStorageService.uploadAttorneyPostImage(image);
  }
}

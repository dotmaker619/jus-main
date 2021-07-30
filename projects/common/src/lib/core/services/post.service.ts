import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PaginationDto, PostDto } from '@jl/common/core/dto';
import { PostMapper } from '@jl/common/core/mappers/post.mapper';
import { Post } from '@jl/common/core/models';
import { Pagination } from '@jl/common/core/models/pagination';
import { AppConfigService } from '@jl/common/core/services/app-config.service';
import { Observable } from 'rxjs';
import { map, mapTo } from 'rxjs/operators';

/** Posts service. */
@Injectable({
  providedIn: 'root',
})
export class PostService {
  private readonly baseUrl = this.appConfig.apiUrl;
  private readonly postsUrl = new URL('forum/posts/', this.baseUrl).toString();

  /** Number of posts on page. */
  public readonly POSTS_PER_PAGE = 10;

  /**
   * @constructor
   * @param http
   * @param postMapper
   */
  public constructor(
    private http: HttpClient,
    private postMapper: PostMapper,
    private appConfig: AppConfigService,
  ) { }

  /** Provide page number by post position */
  public getPageByPosition(position: number): number {
    return Math.floor(position / this.POSTS_PER_PAGE);
  }

  /** Get posts for topic. */
  public getPosts(
    topicId: number,
    page: number = 0,
  ): Observable<Pagination<Post>> {
    let params = new HttpParams()
      .set('topic', topicId.toString())
      .set('limit', this.POSTS_PER_PAGE.toString())
      .set('ordering', 'created');

    let offset = 0;
    if (page) {
      offset = page * this.POSTS_PER_PAGE;
      params = params.set('offset', offset.toString());
    }

    return this.http
      .get<PaginationDto<PostDto>>(this.postsUrl, { params })
      .pipe(
        map((pagination) => {
          return {
            items: pagination.results.map((post) => this.postMapper.fromDto(post)),
            itemsCount: pagination.count,
            pagesCount: Math.ceil(pagination.count / this.POSTS_PER_PAGE),
          } as Pagination<Post>;
        }),
      );
  }

  /**
   * Publish new post.
   * @param post - post information.
   */
  public publishPost(post: Post): Observable<Post> {
    return this.http.post<PostDto>(this.postsUrl, this.postMapper.toDto(post))
      .pipe(
        map((data) => this.postMapper.fromDto(data)),
      );
  }

  /**
   * Return post by id.
   * @param postId
   */
  public getPostById(postId: number): Observable<Post> {
    const postUrl = new URL(`${postId}/`, this.postsUrl).toString();
    return this.http.get<PostDto>(postUrl)
      .pipe(
        map(data => this.postMapper.fromDto(data)),
      );
  }

  /**
   * Delete selected post by id.
   * @param postId
   */
  public deletePostById(postId: number): Observable<void> {
    const deleteUrl = new URL(`${postId}/`, this.postsUrl).toString();
    return this.http.delete<void>(deleteUrl);
  }

  /**
   * Update selected post by id.
   * @param postId
   * @param post
   */
  public updatePostById(postId: number, post: Partial<Post>): Observable<Post> {
    const updateUrl = new URL(`${postId}/`, this.postsUrl).toString();
    return this.http.patch<PostDto>(updateUrl, post)
      .pipe(
        map(updatedPost => this.postMapper.fromDto(updatedPost)),
      );
  }
}

import { ActivatedRoute } from '@angular/router';
import { PostData } from '@jl/common/core/models/post-data';
import { SocialPost } from '@jl/common/core/models/social-post';
import { SocialService } from '@jl/common/core/services/social.service';
import { Observable, ReplaySubject } from 'rxjs';
import { first, switchMap, map, shareReplay, switchMapTo, startWith } from 'rxjs/operators';

/**
 * Base class for social post details page.
 */
export class BaseSocialPostDetailsPage {
  /**
   * Social post.
   */
  public readonly post$: Observable<SocialPost>;

  /**
   * Update post.
   */
  protected readonly updatePost$ = new ReplaySubject<void>(1);

  /**
   * @constructor
   *
   * @param route Activated route.
   * @param socialService Social service.
   */
  public constructor(
    route: ActivatedRoute,
    protected readonly socialService: SocialService,
  ) {
    const id$ = route.paramMap.pipe(
      first(),
      map((params) => parseInt(params.get('id'), 10)),
    );
    this.post$ = this.initSocialPostStream(id$);
  }

  /**
   * Map SocialPost object to PostData object.
   *
   * @param socialPost Social post.
   */
  public mapSocialPostToPostData(socialPost: SocialPost): PostData {
    return new PostData({
      author: {
        id: socialPost.author,
        name: socialPost.authorData.fullName,
        avatar: socialPost.authorData.avatar,
        specialties: socialPost.authorData.specialitiesData.map((spec) => spec.title),
      },
      content: socialPost.body,
      created: socialPost.created,
      id: socialPost.id,
      image: socialPost.image,
      title: socialPost.title,
    });
  }

  private initSocialPostStream(id$: Observable<number>): Observable<SocialPost> {
    return this.updatePost$.pipe(
      startWith(null),
      switchMapTo(id$),
      switchMap((id) => this.socialService.getPost(id)),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }
}

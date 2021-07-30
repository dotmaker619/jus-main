import { Pagination } from '@jl/common/core/models/pagination';
import { PostData } from '@jl/common/core/models/post-data';
import { SocialPost } from '@jl/common/core/models/social-post';
import { SocialService } from '@jl/common/core/services/social.service';
import { Observable, Subject } from 'rxjs';
import { shareReplay, scan, mapTo, startWith, switchMap, switchMapTo } from 'rxjs/operators';

/** Base class for social page component. */
export class BaseSocialPage {
  /** Posts list. */
  public readonly pagination$: Observable<Pagination<SocialPost>>;
  /**
   * Trigger to get posts.
   */
  protected readonly morePosts$ = new Subject<void>();
  /**
   * Trigger to update the list of posts.
   */
  protected readonly updatePosts$ = new Subject<void>();

  /**
   * @constructor
   *
   * @param socialService Social service.
   */
  public constructor(
    protected readonly socialService: SocialService,
  ) {
    this.pagination$ = this.initSocialPaginationStream();
  }

  /**
   * Map SocialPost array to PostData array.
   *
   * @param socialPost SocialPosts list.
   */
  public mapSocialPostsToPostsData(socialPosts: SocialPost[]): PostData[] {
    return socialPosts.map(this.mapSocialPostToPostData);
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

  /**
   * Handle 'click' of 'More posts' button
   */
  public onMorePosts(): void {
    this.morePosts$.next();
  }

  private initSocialPaginationStream(): Observable<Pagination<SocialPost>> {
    const pageAccumulation$ = this.morePosts$.pipe(
      mapTo(1),
      scan(curPage => ++curPage),
      startWith(0),
    );

    const postsPage$ = this.updatePosts$.pipe(
      startWith(null),
      switchMapTo(pageAccumulation$),
    );

    return postsPage$.pipe(
      switchMap((page) => {
        const posts$ = this.socialService.getPosts(page);

        return page === 0
          ? posts$.pipe(startWith(null))
          : posts$;
      }),
      scan((prevPosts: Pagination<SocialPost>, newPosts: Pagination<SocialPost>) => {
        if (prevPosts && newPosts) {
          return {
            items: prevPosts.items.concat(newPosts.items),
            itemsCount: newPosts.itemsCount,
          } as Pagination<SocialPost>;
        }
        return newPosts;
      }, null),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
  }
}

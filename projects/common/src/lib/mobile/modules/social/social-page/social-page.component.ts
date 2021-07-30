import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Role } from '@jl/common/core/models/role';
import { SocialPost } from '@jl/common/core/models/social-post';
import { AuthService } from '@jl/common/core/services/auth.service';
import { SocialService } from '@jl/common/core/services/social.service';
import { BaseSocialPage } from '@jl/common/shared/base-components/social/social-page.base';
import { Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';

/** Social page. */
@Component({
  selector: 'jlc-social-page',
  templateUrl: './social-page.component.html',
  styleUrls: ['./social-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SocialPageComponent extends BaseSocialPage {

  /**
   * @constructor
   *
   * @param socialService Social service.
   */
  public constructor(
    socialService: SocialService,
  ) {
    super(socialService);
  }

  /**
   * Fired when the component routing to has finished animating.
   */
  public ionViewWillEnter(): void {
    this.updatePosts$.next();
  }

  /**
   * Handle 'ionInfinite' of 'ion-infinite-scroll'
   *
   * @param event Event.
   */
  public loadMorePosts(event: CustomEvent): void {
    this.pagination$
      .pipe(first())
      // @ts-ignore the absence of `complete` on CustomEventTarget
      .subscribe(() => event.target.complete());
    this.morePosts$.next();
  }

  /**
   * TrackBy function for post list.
   *
   * @param _ Idx.
   * @param item Social post.
   */
  public trackPost(_: number, item: SocialPost): number {
    return item.id;
  }
}

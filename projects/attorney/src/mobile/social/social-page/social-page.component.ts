import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Role } from '@jl/common/core/models/role';
import { SocialPost } from '@jl/common/core/models/social-post';
import { AuthService } from '@jl/common/core/services/auth.service';
import { SocialService } from '@jl/common/core/services/social.service';
import { BaseSocialPage } from '@jl/common/shared/base-components/social/social-page.base';
import { Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';

import { SavePostComponent } from '../modals/save-post/save-post.component';

/** Social page. */
@Component({
  selector: 'jlat-social-page',
  templateUrl: './social-page.component.html',
  styleUrls: ['./social-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SocialPageComponent extends BaseSocialPage {
  /**
   * Is create button shown.
   */
  public readonly isCreateButtonShown$: Observable<boolean>;

  /**
   * @constructor
   *
   * @param socialService Social service.
   * @param authService Auth service.
   * @param modalCtrl Modal controller.
   */
  public constructor(
    socialService: SocialService,
    authService: AuthService,
    private readonly modalCtrl: ModalController,
  ) {
    super(socialService);

    this.isCreateButtonShown$ = authService.userType$.pipe(
      map((role) => role === Role.Attorney),
    );
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

  /**
   * Handle 'click' of 'Start post' button.
   */
  public onStartPostClick(): void {
    this.openPostCreationModal();
  }

  private async openPostCreationModal(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: SavePostComponent,
    });
    await modal.present();
    const res = await modal.onDidDismiss();
    if (res && res.data) {
      this.updatePosts$.next();
    }
  }
}

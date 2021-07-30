import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ActionSheetController, NavController, ModalController } from '@ionic/angular';
import { User } from '@jl/common/core/models/user';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { SocialService } from '@jl/common/core/services/social.service';
import { AlertService } from '@jl/common/mobile/services/alert.service';
import { BaseSocialPostDetailsPage } from '@jl/common/shared/base-components/social/social-post-details-page.base';
import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { map, startWith, filter, switchMapTo, switchMap, first, tap, takeWhile, take } from 'rxjs/operators';

import { SavePostComponent } from '../modals/save-post/save-post.component';

/**
 * Social post details page.
 */
@Component({
  selector: 'jlat-social-post-details-page',
  templateUrl: './social-post-details-page.component.html',
  styleUrls: ['./social-post-details-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SocialPostDetailsPageComponent extends BaseSocialPostDetailsPage {
  /**
   * Whether current user is a post's author.
   */
  public readonly isCurrentUserAuthor$: Observable<boolean>;
  /**
   * Loading controller.
   */
  public readonly isLoading$ = new BehaviorSubject<boolean>(false);

  /**
   * @constructor
   *
   * @param route Activated route.
   * @param socialService Social service.
   * @param userService user service.
   * @param actionSheetCtrl Action sheet controller.
   * @param navCtrl Nav controller.
   * @param alertService Alert service.
   * @param modalCtrl Modal controller.
   */
  public constructor(
    route: ActivatedRoute,
    socialService: SocialService,
    userService: CurrentUserService,
    private readonly actionSheetCtrl: ActionSheetController,
    private readonly navCtrl: NavController,
    private readonly alertService: AlertService,
    private readonly modalCtrl: ModalController,
  ) {
    super(route, socialService);
    this.isCurrentUserAuthor$ = this.initIsAuthorStream(userService.currentUser$);
  }

  /**
   * Handle 'click' of more button.
   */
  public async onMoreButtonClick(): Promise<void> {
    const actionSheet = await this.actionSheetCtrl.create({
      buttons: [
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => this.deletePost(),
        },
        {
          text: 'Edit',
          handler: () => this.openEditModal(),
        },
        {
          text: 'Cancel',
          role: 'cancel',
        },
      ],
    });
    await actionSheet.present();
  }

  private initIsAuthorStream(curUser$: Observable<User>): Observable<boolean> {
    return combineLatest([
      curUser$,
      this.post$,
    ]).pipe(
      map(([curUser, post]) => curUser && curUser.id === post.author),
      startWith(false),
    );
  }

  private deletePost(): void {
    this.alertService.showConfirmation({
      header: 'Delete post',
      message: 'Are you sure you want to delete the post?',
      cancelButtonText: 'Cancel',
      buttonText: 'Remove',
      isDangerous: true,
    }).pipe(
      takeWhile(val => val),
      tap(() => this.isLoading$.next(true)),
      switchMapTo(this.post$),
      switchMap((post) => this.socialService.deletePost(post.id)),
      onMessageOrFailed(() => this.isLoading$.next(false)),
      take(1),
    ).subscribe(() => {
      this.navCtrl.navigateBack('/social', { state: { reload: true } });
    });
  }

  private openEditModal(): void {
    this.post$.pipe(
      first(),
      switchMap((post) => this.modalCtrl.create({
        component: SavePostComponent,
        componentProps: {
          post: post,
        },
      })),
      switchMap((modal) => modal.present() && modal.onDidDismiss()),
      filter((res) => res && res.data),
    ).subscribe(() => this.updatePost$.next());
  }
}

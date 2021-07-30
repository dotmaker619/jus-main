import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { SavePostComponent } from '@jl/attorney/desktop/social/modals/save-post/save-post.component';
import { PostActions } from '@jl/common/core/models/post-actions';
import { SocialPost } from '@jl/common/core/models/social-post';
import { SocialService } from '@jl/common/core/services/social.service';
import { SelectedPostAction } from '@jl/common/desktop/components/social-posts-list/social-posts-list.component';
import { DialogsService } from '@jl/common/shared';
import { BaseSocialPage } from '@jl/common/shared/base-components/social/social-page.base';
import { first, } from 'rxjs/operators';

/**
 * Social page.
 */
@Component({
  selector: 'jlat-social-page',
  templateUrl: './social-page.component.html',
  styleUrls: ['./social-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SocialPageComponent extends BaseSocialPage {

  /**
   * @constructor
   * @param router Router
   * @param socialService Social service.
   * @param dialogService Dialog service.
   */
  public constructor(
    socialService: SocialService,
    private readonly router: Router,
    private readonly dialogService: DialogsService,
  ) {
    super(socialService);
  }

  /**
   * Handle 'click' of 'More posts' button
   */
  public onMorePosts(): void {
    this.morePosts$.next();
  }

  /**
   * Handle 'click' of 'Start post' button.
   */
  public onStartPostClick(): void {
    this.openPostCreationModal();
  }

  /**
   * Handle 'more' of 'jlat-post-list-item' component.
   * @param id Post id.
   */
  public onShowMore(id: number): void {
    this.router.navigate(['/social', id]);
  }

  /**
   * Handle 'action' of 'jlat-post-list-item' component
   * @param action Action
   * @param postId Post id.
   */
  public onActionSelect(selectedAction: SelectedPostAction): void {
    const { post, action } = selectedAction;
    if (action === PostActions.Delete) {
      this.dialogService.showConfirmationDialog({
        title: 'Delete post',
        message: 'Are you sure you want to delete the post?',
        cancelButtonText: 'Cancel',
        confirmationButtonText: 'Remove',
      }).then((val) => val ? this.deletePost(post.id) : null);
      return;
    }
    if (action === PostActions.Edit) {
      this.openPostCreationModal(post);
      return;
    }
  }

  private openPostCreationModal(post?: SocialPost): void {
    this.dialogService.openDialog(SavePostComponent, post)
      .then((res) => {
        if (res) {
          this.updatePosts$.next();
        }
      });
  }

  /**
   * Delete post
   *
   * @param id Post id.
   */
  protected deletePost(id: number | string): void {
    this.socialService.deletePost(id)
      .pipe(first())
      .subscribe(() => this.updatePosts$.next());
  }
}

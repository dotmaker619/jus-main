import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { SocialService } from '@jl/common/core/services/social.service';
import { BaseSocialPage } from '@jl/common/shared/base-components/social/social-page.base';

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
   * @param router Router
   */
  public constructor(
    socialService: SocialService,
    protected readonly router: Router,
  ) {
    super(socialService);
  }

  /**
   * Handle 'more' of 'jlc-post-list-item' component.
   * @param id Post id.
   */
  public onShowMore(id: number): void {
    this.router.navigate(['/social', id]);
  }
}

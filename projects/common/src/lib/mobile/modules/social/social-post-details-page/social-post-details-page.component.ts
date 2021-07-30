import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SocialService } from '@jl/common/core/services/social.service';
import { BaseSocialPostDetailsPage } from '@jl/common/shared/base-components/social/social-post-details-page.base';
import { BehaviorSubject } from 'rxjs';

/**
 * Social post details page.
 */
@Component({
  selector: 'jlc-social-post-details-page',
  templateUrl: './social-post-details-page.component.html',
  styleUrls: ['./social-post-details-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SocialPostDetailsPageComponent extends BaseSocialPostDetailsPage {
  /**
   * Loading controller.
   */
  public readonly isLoading$ = new BehaviorSubject<boolean>(false);

  /**
   * @constructor
   *
   * @param route Activated route.
   * @param socialService Social service.
   */
  public constructor(
    route: ActivatedRoute,
    socialService: SocialService,
  ) {
    super(route, socialService);
  }
}

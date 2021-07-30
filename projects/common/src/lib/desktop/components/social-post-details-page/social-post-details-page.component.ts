import { Component, ChangeDetectionStrategy } from '@angular/core';
import { BaseSocialPostDetailsPage } from '@jl/common/shared/base-components/social/social-post-details-page.base';

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

}

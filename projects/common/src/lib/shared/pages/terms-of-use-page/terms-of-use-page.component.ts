import { Location } from '@angular/common';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { PlatformService } from '@jl/common/core/services/platform.service';

/**
 * Page with Terms of Use.
 */
@Component({
  selector: 'jlc-terms-of-use-page',
  templateUrl: './terms-of-use-page.component.html',
  styleUrls: ['./terms-of-use-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TermsOfUsePageComponent {

  /**
   * @constructor
   *
   * @param location Angular location service.
   * @param platformService Platform service.
   */
  public constructor(
    private readonly location: Location,
    private readonly platformService: PlatformService,
  ) {
  }

  /**
   * Show extra header on tablets.
   */
  public isShowHeader(): boolean {
    return !this.platformService.isWeb;
  }

  /**
   * Handle click on `Back` button.
   */
  public onBackClick(): void {
    this.location.back();
  }
}

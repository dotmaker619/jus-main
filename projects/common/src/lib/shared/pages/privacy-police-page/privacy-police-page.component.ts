import { Location } from '@angular/common';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { PlatformService } from '@jl/common/core/services/platform.service';

/**
 * Page with Privacy Policy.
 */
@Component({
  selector: 'jlc-privacy-police-page',
  templateUrl: './privacy-police-page.component.html',
  styleUrls: ['./privacy-police-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrivacyPolicePageComponent {

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

import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AppConfigService } from '@jl/common/core/services/app-config.service';

/**
 * Component to provide fallback screen in case of
 * attorney user access of restricted pages.
 */
@Component({
  selector: 'jlc-attorney-user-fallback',
  templateUrl: './attorney-user-fallback.component.html',
  styleUrls: ['./attorney-user-fallback.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttorneyUserFallbackComponent { }

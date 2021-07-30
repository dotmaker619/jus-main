import { Component, ChangeDetectionStrategy } from '@angular/core';
import { BaseAttorneyProfilePage } from '@jl/common/shared/base-components/attorneys/attorney-profile-page.base';

/** Profile page component. */
@Component({
  selector: 'jlc-attorney-profile-page',
  templateUrl: './attorney-profile-page.component.html',
  styleUrls: ['./attorney-profile-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttorneyProfilePageComponent extends BaseAttorneyProfilePage {

}

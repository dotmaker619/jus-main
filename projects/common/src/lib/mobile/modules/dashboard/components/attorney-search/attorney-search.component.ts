import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AttorneySearchBase } from '@jl/common/shared/base-components/dashboard/attorney-search.base';

/**
 * Component to provide data for attorney search.
 */
@Component({
  selector: 'jlc-attorney-search',
  templateUrl: './attorney-search.component.html',
  styleUrls: ['./attorney-search.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttorneySearchComponent extends AttorneySearchBase {
}

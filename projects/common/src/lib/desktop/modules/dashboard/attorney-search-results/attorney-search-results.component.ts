import { Component, ChangeDetectionStrategy } from '@angular/core';
import { BaseAttorneySearchResults } from '@jl/common/shared/base-components/attorneys/attorney-search-results.base';

/**
 * Display attorneys found within user location.
 */
@Component({
  selector: 'jlc-attorney-search-results',
  templateUrl: './attorney-search-results.component.html',
  styleUrls: ['./attorney-search-results.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttorneySearchResultsComponent extends BaseAttorneySearchResults {

}

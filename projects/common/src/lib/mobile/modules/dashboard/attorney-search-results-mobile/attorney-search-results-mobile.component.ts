import { trigger, animate, transition, style } from '@angular/animations';
import { Component, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { Attorney } from '@jl/common/core/models/attorney';
import { BaseAttorneySearchResults } from '@jl/common/shared/base-components/attorneys/attorney-search-results.base';
import { BehaviorSubject } from 'rxjs';

/** Attorney search results page. */
@Component({
  selector: 'jlc-attorney-search-results-mobile',
  templateUrl: './attorney-search-results-mobile.component.html',
  styleUrls: ['./attorney-search-results-mobile.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('easeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate(100, style({ opacity: 1 })),
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate(100, style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class AttorneySearchResultsMobileComponent extends BaseAttorneySearchResults {
  /** Is map expanded. */
  public readonly isMapExpanded$ = new BehaviorSubject<boolean>(false);

  /** Map container ref. */
  @ViewChild('mapContainer', { static: true })
  public mapContainer: ElementRef;

  /** Toggle map size. */
  public toggleMap(): void {
    this.isMapExpanded$.next(!this.isMapExpanded$.value);
  }

  /** @inheritdoc */
  public onAttorneyClick(attorney: Attorney): void {
    this.selectedAttorney$.next(attorney);
  }

  /**
   * Show selected attorney on a map.
   * @param attorney Attorney.
   */
  public onLocationClick(): void {
    this.isMapExpanded$.next(true);
    this.mapContainer.nativeElement.scrollIntoView();
  }

  /**
   * Scroll to selected attorney.
   * @param attorney Attorney.
   */
  public onMapAttorneySelect(attorney: Attorney): void {
    this.isMapExpanded$.next(false);
    this.selectedAttorney$.next(attorney);
    this.attorneyContainer
      .nativeElement
      .children
      .namedItem(`attorney-card-${attorney.id}`)
      .scrollIntoView();
  }
}

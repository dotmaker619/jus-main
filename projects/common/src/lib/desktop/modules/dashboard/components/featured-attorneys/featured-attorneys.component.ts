import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Attorney } from '@jl/common/core/models/attorney';
import { AttorneysService } from '@jl/common/core/services/attorneys.service';
import { PlaceResult } from '@jl/common/core/services/location.service';
import { trackById } from '@jl/common/core/utils/trackby-id';
import { Observable, BehaviorSubject } from 'rxjs';
import { shareReplay, switchMap } from 'rxjs/operators';

/** Featured attorneys component */
@Component({
  selector: 'jlc-featured-attorneys',
  templateUrl: './featured-attorneys.component.html',
  styleUrls: ['./featured-attorneys.component.css'],
})
export class FeaturedAttorneysComponent implements OnChanges {
  /**
   * Location to be used for featured attorney ordering.
   */
  @Input()
  public place: PlaceResult;
  /** Attorneys list. */
  public readonly featuredAttorneys$: Observable<Attorney[]>;
  /** TrackBy function */
  public readonly trackAttorney = trackById;

  private readonly searchLocation$ = new BehaviorSubject<void>(null);

  /**
   * @constructor
   *
   * @param attorneysService Attorney service.
   */
  public constructor(
    private attorneysService: AttorneysService,
  ) {
    this.featuredAttorneys$ = this.searchLocation$
      .pipe(
        switchMap(() => this.attorneysService.getFeaturedAttorneys(this.place)),
        shareReplay({ bufferSize: 1, refCount: true }),
      );

  }

  /**
   * @inheritDoc
   * @param changes
   */
  public ngOnChanges(changes: SimpleChanges): void {
    if ('place' in changes && changes != null) {
      this.searchLocation$.next(null);
    }
  }

  /** Obtain background value for attorney tile. */
  public obtainBackground(attorney: Attorney): string {
    return `url(${attorney.avatar})`;
  }
}

import { Component, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { Attorney } from '@jl/common/core/models/attorney';
import { AttorneysService } from '@jl/common/core/services/attorneys.service';
import { PlaceResult } from '@jl/common/core/services/location.service';
import { trackById } from '@jl/common/core/utils/trackby-id';
import { Observable, BehaviorSubject } from 'rxjs';
import { shareReplay, switchMap } from 'rxjs/operators';

/** Sponsored attorneys component */
@Component({
  selector: 'jlc-sponsored-attorneys',
  templateUrl: './sponsored-attorneys.component.html',
  styleUrls: ['./sponsored-attorneys.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SponsoredAttorneysComponent implements OnChanges {
  /**
   * Location to be used for featured attorney ordering.
   */
  @Input()
  public place: PlaceResult;
  /**
   * Stream with list of sponsored attorneys
   */
  public readonly sponsoredAttorneys$: Observable<Attorney[]>;
  /**
   * TrackBy function
   */
  public readonly trackAttorney = trackById;

  private readonly searchLocation$ = new BehaviorSubject<void>(null);

  /**
   * @constructor
   *
   * @param attorneysService Attorney service.
   */
  public constructor(
    attorneysService: AttorneysService,
    private readonly router: Router,
  ) {
    this.sponsoredAttorneys$ = this.searchLocation$
      .pipe(
        switchMap(() => attorneysService.getSponsoredAttorneys(this.place)),
        shareReplay({ bufferSize: 1, refCount: true }),
      );
  }

  /**
   * @inheritdoc
   *
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

  /**
   * Navigate to attorney.
   */
  public navigateToAttorney(id: number): void {
    this.router.navigate(['attorneys/profile/', id]);
  }
}

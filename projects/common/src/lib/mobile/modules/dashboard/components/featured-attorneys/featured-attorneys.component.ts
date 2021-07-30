import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { IonSlides } from '@ionic/angular';
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
  /**
   * Slider element.
   */
  @ViewChild('slider', { static: false })
  public slider: IonSlides;
  /**
   * Featured attorneys grouped by 4 as observable.
   */
  public readonly attorneys$: Observable<Attorney[]>;
  /**
   * Slider options.
   */
  public readonly slideOpts = {
    slidesPerView: 1.3,
    spaceBetween: 10,
    centeredSlides: true,
  };
  /** Track function by id. */
  public readonly trackById = trackById;

  private readonly searchLocation$ = new BehaviorSubject<void>(null);

  /**
   * @constructor
   *
   * @param attorneysService Attorney service.
   */
  public constructor(
    private attorneysService: AttorneysService,
  ) {
    this.attorneys$ = this.initFeaturedAttornyesStream();
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

  /** Swipe attorneys to left */
  public swipeToLeft(): void {
    this.slider.slidePrev();
  }

  /** Swipe attorneys to right */
  public swipeToRight(): void {
    this.slider.slideNext();
  }

  private initFeaturedAttornyesStream(): Observable<Attorney[]> {
    return this.searchLocation$
      .pipe(
        switchMap(() => this.attorneysService.getFeaturedAttorneys(this.place)),
        shareReplay({ bufferSize: 1, refCount: true }),
      );
  }
}

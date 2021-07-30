import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ReplaySubject, Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

/** Modal displaying a map with points. */
@Component({
  selector: 'jlc-points-on-map-modal',
  templateUrl: './points-on-map-modal.component.html',
  styleUrls: ['./points-on-map-modal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PointsOnMapModalComponent {
  /** Coordinates array. */
  public readonly coordsArray$ = new ReplaySubject<Coordinates[]>(1);

  /** Map location. */
  public readonly mapLocation$: Observable<Coordinates>;

  /** Coordinates or an array of coordinates. */
  @Input()
  public set coordinates(coords: Coordinates | Coordinates[]) {
    if (coords != null) {
      if (coords instanceof Array) {
        this.coordsArray$.next(coords);
      } else {
        this.coordsArray$.next([coords]);
      }
    }
  }

  /** Modal title. */
  @Input()
  public title: string;

  /**
   * @constructor
   * @param modalController Modal controller.
   */
  public constructor(
    private readonly modalController: ModalController,
  ) {
    this.mapLocation$ = this.coordsArray$.pipe(
      map(coordsArray => coordsArray[0]),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
  }

  /**
   * Handles click on close button.
   */
  public onCloseClick(): void {
    this.modalController.dismiss();
  }
}

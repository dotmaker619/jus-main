import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Matter } from '@jl/common/core/models';
import { MatterStatus } from '@jl/common/core/models/matter-status';
import { MattersService } from '@jl/common/core/services/attorney/matters.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { first, share } from 'rxjs/operators';

/**
 * Active clients for mobile clients page.
 */
@Component({
  selector: 'jlat-active-clients-page',
  templateUrl: './active-clients-page.component.html',
  styleUrls: ['./active-clients-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActiveClientsPageComponent {
  /**
   * Matters.
   */
  public matters$: Observable<Matter[]>;
  /**
   * Loading controller.
   */
  public isLoading$ = new BehaviorSubject<boolean>(false);

  /**
   * @constructor
   *
   * @param mattersService Matter service.
   */
  public constructor(
    private readonly mattersService: MattersService,
  ) {
    this.matters$ = this.initMattersStream();
  }

  /**
   * TrackBy function for the matters list.
   *
   * @param _ Idx.
   * @param item Matter.
   */
  public trackMatter(_: number, item: Matter): number {
    return item.id;
  }

  private initMattersStream(): Observable<Matter[]> {
    return this.mattersService.getMatters({ statuses: [MatterStatus.Active] })
      .pipe(
        first(),
        share(),
      );
  }
}

import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DestroyableBase } from '@jl/common/core';
import { Matter } from '@jl/common/core/models';
import { MatterStatus } from '@jl/common/core/models/matter-status';
import { MattersService } from '@jl/common/core/services/attorney/matters.service';
import { Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

/** Matters list component. Used in mobile workspace. */
@Component({
  selector: 'jlc-matters-list',
  templateUrl: './matters-list.component.html',
  styleUrls: ['./matters-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MattersListComponent extends DestroyableBase {

  /** Matters. */
  public matters$: Observable<Matter[]>;

  /**
   * @constructor
   *
   * @param mattersService Matters service.
   * @param activatedRoute Activated route.
   */
  public constructor(
    private readonly mattersService: MattersService,
    private readonly activatedRoute: ActivatedRoute,
  ) {
    super();
    const matterStatuses = this.activatedRoute.snapshot.data.statuses;
    this.matters$ = this.initMattersStream(matterStatuses);
  }

  /** Init matters stream. */
  public initMattersStream(statuses: MatterStatus[]): Observable<Matter[]> {
    return this.activatedRoute.queryParams.pipe(
      switchMap(({ order }) => this.mattersService.getMatters({
        order, statuses,
      })),
    );
  }

  /** Trackby function. */
  public trackMatterItem(_: number, matter: Matter): number {
    return matter.id;
  }
}

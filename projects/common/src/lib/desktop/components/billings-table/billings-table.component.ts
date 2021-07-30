import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { Matter } from '@jl/common/core/models/matter';
import { Pagination } from '@jl/common/core/models/pagination';
import { RateType } from '@jl/common/core/models/rate-type';
import { TimeBilling } from '@jl/common/core/models/time-billing';
import { trackById } from '@jl/common/core/utils/trackby-id';

/** Time billings section component. */
@Component({
  selector: 'jlc-billings-table',
  templateUrl: './billings-table.component.html',
  styleUrls: ['./billings-table.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class BillingsTableComponent {

  /** Rate type enum. */
  public RateType = RateType;

  /** Matter. */
  @Input()
  public matter: Matter;

  /** Time billings for the matter. */
  @Input()
  public billings: Pagination<TimeBilling>;

  /** May rows be selected. */
  @Input()
  public active = false;

  /** Should 'Logged by' column be displayed. */
  @Input()
  public isLoggedByColumnDisplayed = false;

  /** Time billing emitter. */
  @Output()
  public timeBillingSelected = new EventEmitter<TimeBilling>();

  /** Current limit for displaying time billings. */
  @Output()
  public limitChange = new EventEmitter<number>();

  /** Trackby function. */
  public trackById = trackById;

  /** Total number of billings. */
  public get numberOfBillings(): number {
    return this.billings.itemsCount;
  }

  /** Time billings. */
  public get billingItems(): TimeBilling[] {
    return this.billings && this.billings.items;
  }

  /** Shows whether is all the billings are displayed */
  public get isAllBillingsDisplayed(): boolean {
    // Check whether the pagination info has more items than it is.
    return this.numberOfBillings === this.billingItems.length;
  }

  /** Emit number of items to unfold table. */
  public onTableUnfold(): void {
    this.limitChange.next(this.numberOfBillings);
  }

  /** On row click. Emits clicked item outside a component. */
  public onRowClick(timeBilling: TimeBilling): void {
    this.timeBillingSelected.next(timeBilling);
  }
}

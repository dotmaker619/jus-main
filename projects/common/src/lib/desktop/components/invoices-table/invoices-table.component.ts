import { Component, ChangeDetectionStrategy, Input, Output } from '@angular/core';
import { Invoice } from '@jl/common/core/models/invoice';
import { trackById } from '@jl/common/core/utils/trackby-id';
import { Observable, BehaviorSubject } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

/** Ordering */
enum Ordering {
  /** Ascending order. */
  ASC = '-created',
  /** Descending order. */
  DESC = 'created',
}

const DEFAULT_ORDERING = Ordering.ASC;

/** Invoices table component. */
@Component({
  selector: 'jlc-invoices-table',
  templateUrl: './invoices-table.component.html',
  styleUrls: ['./invoices-table.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoicesTableComponent {
  /** Array of invoices */
  @Input()
  public invoices: Invoice[];
  /**
   * Is attorney table.
   *
   * @description
   * Depends on the current user role member column name is attorney/client.
   */
  @Input()
  public isAttorneyTable = true;

  /** Ordering change emitter. */
  @Output()
  public readonly orderChange = new BehaviorSubject<Ordering>(DEFAULT_ORDERING);

  /** Sort direction */
  public readonly Ordering = Ordering;

  /** Ordering observable. */
  public readonly currentOrdering$: Observable<Ordering>;

  /** Trackby function. */
  public trackById = trackById;

  /**
   * @constructor
   */
  public constructor() {
    this.currentOrdering$ = this.initCurrentOrderStream();
  }

  /** Emit sort change. */
  public toggleSortingByDate(currentOrder: Ordering): void {
    const nextOrder = currentOrder === Ordering.ASC ? Ordering.DESC : Ordering.ASC;
    this.orderChange.next(nextOrder);
  }

  private initCurrentOrderStream(): Observable<Ordering> {
    return this.orderChange.pipe(
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
  }
}

import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Invoice } from '@jl/common/core/models/invoice';
import { Role } from '@jl/common/core/models/role';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { ReplaySubject, Observable } from 'rxjs';
import { map, first } from 'rxjs/operators';

/** Invoices list component. */
@Component({
  selector: 'jlc-invoices-list',
  templateUrl: './invoices-list.component.html',
  styleUrls: ['./invoices-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoicesListComponent {

  /** Invoices. */
  @Input()
  public set invoices(i: Invoice[]) {
    this.invoices$.next(i);
  }

  /** Invoices. */
  public readonly invoices$ = new ReplaySubject<Invoice[]>(1);

  /** Is current user a client */
  public readonly isClient$: Observable<boolean>;

  /**
   * @constructor
   * @param curUserService Service to work with current user.
   */
  public constructor(curUserService: CurrentUserService) {
    this.isClient$ = curUserService.currentUser$.pipe(
      first(),
      map(user => user.role === Role.Client),
    );
  }

  /**
   * Trackby function.
   * @param _ Idx.
   * @param invoice Invoice.
   */
  public trackInvoiceById(_: number, invoice: Invoice): number {
    return invoice.id;
  }
}

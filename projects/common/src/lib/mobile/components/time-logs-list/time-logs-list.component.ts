import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { BillingPagination } from '@jl/common/core/services/attorney/time-billing.service';
import { trackById } from '@jl/common/core/utils/trackby-id';

/** Component to display invoice logs in list. */
@Component({
  selector: 'jlc-time-logs-list',
  templateUrl: './time-logs-list.component.html',
  styleUrls: ['./time-logs-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimeLogsListComponent {
  /** Billings info. */
  @Input()
  public billings: BillingPagination;

  /** Is column with logger user should be displayed. */
  @Input()
  public isLoggedByColumnDisplayed = false;

  /** Trackby function. */
  public trackById = trackById;
}

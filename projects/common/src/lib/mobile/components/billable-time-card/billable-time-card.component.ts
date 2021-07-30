import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Period } from '@jl/common/core/models/period';
import { TimeBilling } from '@jl/common/core/models/time-billing';
import { BillingPagination } from '@jl/common/core/services/attorney/time-billing.service';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { JusLawDateUtils } from '@jl/common/core/utils/date-utils';
import { trackById } from '@jl/common/core/utils/trackby-id';
import { Observable } from 'rxjs';
import { mapTo, tap, startWith, map, first } from 'rxjs/operators';

const INITIAL_DATE = new Date();

/** Card component displaying billing info. */
@Component({
  selector: 'jlc-billable-time-card',
  templateUrl: './billable-time-card.component.html',
  styleUrls: ['./billable-time-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillableTimeCardComponent {
  /** Billings info. */
  @Input()
  public billings: BillingPagination;

  /** Are billings editable. */
  @Input()
  public editable = false;

  /** Is column with logger user should be displayed. */
  @Input()
  public isLoggedByColumnDisplayed = false;

  /** Whether the month filter should be displayed. */
  @Input()
  public showFilter = true;

  /** Period change event. */
  @Output()
  public periodChange = new EventEmitter<Period>();

  /** On billing click. */
  @Output()
  public billingClick = new EventEmitter<TimeBilling>();

  /** Filter form. */
  public filterForm$: Observable<FormGroup>;

  /** Trackby function. */
  public trackById = trackById;

  /**
   * @constructor
   * @param formBuilder
   * @param userService
   */
  public constructor(
    private readonly formBuilder: FormBuilder,
    private readonly userService: CurrentUserService,
  ) {
    this.filterForm$ = this.initFormStream();
  }

  private initFormStream(): Observable<FormGroup> {
    const form = this.formBuilder.group({
      month: [INITIAL_DATE.toString()],
    });

    const controlValue = form.controls.month;

    const sideEffect$ = controlValue.valueChanges.pipe(
      startWith(controlValue.value),
      map(value => JusLawDateUtils.makeMonthPeriod(new Date(value))),
      tap(period => this.periodChange.emit(period)),
    );

    return sideEffect$.pipe(
      startWith(null),
      mapTo(form),
    );
  }

  /** Should details arrow be hidden. */
  public get shouldHideArrow(): boolean {
    return this.billings == null || this.billings.items.length === 0;
  }

  /**
   * Handle click on a job.
   * @param billing Job.
   */
  public onBillingClick(billing: TimeBilling): void {
    if (this.editable) {
      this.billingClick.emit(billing);
    }
  }

  /**
   * Can billing log be edit.
   *
   * @param billing Time billing.
   */
  public isBillingLogEditable(billing: TimeBilling): Observable<boolean> {
    return this.userService.currentUser$.pipe(
      first(),
      map((user) => this.editable && user.id === billing.createdBy.id),
    );
  }
}

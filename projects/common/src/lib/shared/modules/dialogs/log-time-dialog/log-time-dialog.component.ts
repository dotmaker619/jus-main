import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { TEntityValidationErrors, ApiValidationError } from '@jl/common/core/models/api-error';
import { Matter } from '@jl/common/core/models/matter';
import { TimeBilling } from '@jl/common/core/models/time-billing';
import { catchValidationError } from '@jl/common/core/rxjs';
import { MattersService } from '@jl/common/core/services/attorney/matters.service';
import { TimeBillingService } from '@jl/common/core/services/attorney/time-billing.service';
import { JusLawDateUtils } from '@jl/common/core/utils/date-utils';
import { MIN_LOG_TIME_DATE } from '@jl/common/shared/constants/matter-constants';
import { AbstractDialog, } from '@jl/common/shared/modules/dialogs/abstract-dialog';
import { DialogsService } from '@jl/common/shared/modules/dialogs/dialogs.service';
import { BehaviorSubject, EMPTY, from, Observable, throwError } from 'rxjs';
import { first, finalize, switchMap, filter, tap } from 'rxjs/operators';

const MIN_MINUTES_LOGGED = 1;

/**
 * Log time dialog options.
 */
export interface LogTimeDialogOptions {
  /** Matter. */
  matter: Matter;
  /** Invoice id */
  invoiceId?: number;
  /** Existing time billing. */
  timeBilling?: TimeBilling;
}

/** Log time dialog. */
@Component({
  selector: 'jlc-log-time-dialog',
  templateUrl: './log-time-dialog.component.html',
  styleUrls: ['./log-time-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogTimeDialogComponent extends AbstractDialog<LogTimeDialogOptions, void> implements OnInit {

  /** Form for logging time. */
  public formGroup = this.fb.group({
    date: [new Date().toISOString(), [Validators.required]],
    spentMinutes: [null, [Validators.required, Validators.min(MIN_MINUTES_LOGGED)]],
    matter: [null, [Validators.required]],
    description: [null, [Validators.required]],
    invoice: [{
      value: null,
      disabled: true,
    }],
  });

  /** Is loading. */
  public isLoading$ = new BehaviorSubject<boolean>(false);

  /** Matter options */
  public matterOptions$ = this.mattersService.getMatters();

  /** Validation errors for form. */
  public validationError$ = new BehaviorSubject<TEntityValidationErrors<TimeBilling>>({});

  /**
   * @constructor
   * @param timeBillingService Time billing service.
   * @param fb Form builder
   * @param mattersService Matters service.
   * @param dialogsService Dialogs service.
   */
  public constructor(
    protected readonly timeBillingService: TimeBillingService,
    protected readonly fb: FormBuilder,
    protected readonly mattersService: MattersService,
    protected readonly dialogsService: DialogsService,
  ) {
    super();
  }

  /** @inheritdoc */
  public ngOnInit(): void {
    this.fillFormWithValues();
  }

  private fillFormWithValues(): void {
    this.formGroup.controls.matter.setValue(this.matter.id);

    /** If timeBilling option is presented. */
    if (this.timeBilling != null) {
      this.formGroup.controls.spentMinutes.setValue(this.timeBilling.spentMinutes);
      this.formGroup.controls.description.setValue(this.timeBilling.description);
      this.formGroup.controls.date.setValue(this.timeBilling.date);
    }

    if (this.invoiceId || this.matter) {
      this.formGroup.controls.matter.disable();
    }
  }

  /** Matter. */
  public get matter(): Matter {
    return this.options.matter;
  }

  /**
   * Existing time billing.
   */
  public get timeBilling(): TimeBilling {
    return this.options.timeBilling;
  }

  /**
   * Invoice id.
   */
  public get invoiceId(): number {
    return this.options.invoiceId;
  }

  /** Is modal opened in editing mode. */
  public get isEditingMode(): boolean {
    // If timeBilling is presented - modal opened in editing mode.
    return this.timeBilling != null;
  }

  /** Client name. */
  public get clientInfo(): string {
    if (this.matter == null) {
      return null;
    }

    let clientName: string;

    if (this.matter.client) {
      clientName = this.matter.client.fullName;
    }

    return `ID #${this.matter.id} - ${clientName}`;
  }

  /** Log time. */
  public onSubmit(): void {
    this.performSavingAction().subscribe(() => {
      this.close();
    });
  }

  /** Close dialog. */
  public onCloseClicked(): void {
    this.close();
  }

  /** Perform saving job action. */
  protected performSavingAction(): Observable<void> {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid || this.isLoading$.value) {
      return throwError(new Error('Form invalid or the app is loading'));
    }
    this.isLoading$.next(true);
    // Convert hours to minutes.
    const spentMinutes = this.formGroup.controls.spentMinutes.value as number;

    const newTimeBilling = new TimeBilling({
      spentMinutes,
      date: this.formGroup.controls.date.value,
      description: this.formGroup.controls.description.value,
      matter: { id: this.formGroup.controls.matter.value } as Matter,
    });

    if (this.invoiceId) {
      newTimeBilling.invoice = this.invoiceId;
    }

    this.isLoading$.next(true);

    let timeBillingRequest$: Observable<void>;
    if (this.isEditingMode) {
      timeBillingRequest$ = this.timeBillingService.updateBilling(this.timeBilling.id, newTimeBilling);
    } else {
      timeBillingRequest$ = this.timeBillingService.billTime(newTimeBilling);
    }

    return timeBillingRequest$.pipe(
      first(),
      catchValidationError((error: ApiValidationError<TimeBilling>) => {
        this.validationError$.next(error.validationData);
        return EMPTY;
      }),
      finalize(() => {
        this.isLoading$.next(false);
      }),
    );
  }

  /**
   * Filter dates for time billing datepicker.
   * @param date
   */
  public filterDatesForMatter = (date: Date): boolean => {
    // Allow bill to any date between date created and now.
    const fromDate = MIN_LOG_TIME_DATE;
    const toDate = this.matter && this.matter.completed
      ? JusLawDateUtils.getEndOfDay(this.matter.completed)
      : JusLawDateUtils.getEndOfDay(new Date());
    return +date >= +fromDate && +date <= +toDate;
  }

  /**
   * Ask permission to delete a job, if the answer is positive - delete it.
   */
  public onDeleteClicked(): void {
    from(this.dialogsService.showConfirmationDialog({
      title: 'Delete',
      message: 'Are you sure you want to delete the job?',
      confirmationButtonClass: 'danger',
    })).pipe(
      first(),
      filter(shouldDelete => shouldDelete),
      tap(() => this.isLoading$.next(true)),
      switchMap(() => this.timeBillingService.removeBilling(this.timeBilling.id).pipe(first())),
      tap(() => this.close()),
      finalize(() => {
        this.isLoading$.next(false);
      }),
    ).subscribe();
  }
}

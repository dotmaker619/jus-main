import { KeyValue } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DateTimePickerOptions } from '@jl/common/core/models/date-time-picker-options';
import { InvoiceStatisticsFormat } from '@jl/common/core/models/invoice-statistics-format';
import { StatisticsService } from '@jl/common/core/services/attorney/statistics.service';
import { FileService } from '@jl/common/core/services/file.service';
import { JusLawValidators } from '@jl/common/core/validators/validators';
import { AbstractDialog } from '@jl/common/shared';
import { BehaviorSubject } from 'rxjs';
import { first, switchMap, tap } from 'rxjs/operators';

/** Dialog to export invoices statistics. */
@Component({
  selector: 'jlc-export-statistics-dialog',
  templateUrl: './export-statistics.component.html',
  styleUrls: ['./export-statistics.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExportStatisticsDialogComponent extends AbstractDialog {
  /** Form with export params */
  public readonly form: FormGroup;
  /** Datepicker options. */
  public readonly datePickerOptions: DateTimePickerOptions = {
    displayFormat: 'MM DD YYYY',
    placeholder: 'MM DD YYYY',
    max: new Date().toISOString(),
  };
  /** Export file formats. */
  public readonly formats: KeyValue<InvoiceStatisticsFormat, string>[] = [
    { key: InvoiceStatisticsFormat.XLS, value: 'XLS' },
    { key: InvoiceStatisticsFormat.CSV, value: 'CSV' },
    { key: InvoiceStatisticsFormat.XLSX, value: 'XLSX' },
  ];
  /** Loading controller. */
  public readonly isLoading$ = new BehaviorSubject(false);

  /**
   * @constructor
   *
   * @param fb Form builder
   * @param statisticsService Statistics service.
   * @param fileService File service.
   */
  public constructor(
    fb: FormBuilder,
    private readonly statisticsService: StatisticsService,
    private readonly fileService: FileService,
  ) {
    super();
    this.form = this.initFormGroup(fb);
  }

  /**
   * Handle 'submit' of the params form.
   * @param form Form group instance.
   */
  public onFormSubmit(form: FormGroup): void {
    form.markAllAsTouched();
    if (form.invalid || this.isLoading$.value) {
      return;
    }
    this.isLoading$.next(true);
    this.statisticsService.exportInvoiceStatistics(
      form.value.period.start,
      form.value.period.end,
      form.value.format,
    ).pipe(
      first(),
      tap(() => this.isLoading$.next(false)),
      switchMap((stat) => this.fileService.downloadFile(stat.file, stat.name)),
    ).subscribe();
  }

  /**
   * Handle 'click' of the 'Close' button.
   */
  public onCloseClick(): void {
    this.close();
  }

  private initFormGroup(fb: FormBuilder): FormGroup {
    return fb.group({
      period: fb.group({
        start: [null, [Validators.required]],
        end: [null, [Validators.required]],
      }, { validator: JusLawValidators.dateRange('start', 'end') }),
      format: [InvoiceStatisticsFormat.XLS],
    });
  }
}

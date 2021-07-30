import { KeyValue } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { DateTimePickerOptions } from '@jl/common/core/models/date-time-picker-options';
import { InvoiceStatisticsFormat } from '@jl/common/core/models/invoice-statistics-format';
import { StatisticsService } from '@jl/common/core/services/attorney/statistics.service';
import { FileService } from '@jl/common/core/services/file.service';
import { JusLawValidators } from '@jl/common/core/validators/validators';
import { BehaviorSubject } from 'rxjs';
import { first, switchMap, tap } from 'rxjs/operators';

/** Modal window to export invoices statistics. */
@Component({
  selector: 'jlc-export-statistics-modal',
  templateUrl: './export-statistics-modal.component.html',
  styleUrls: ['./export-statistics-modal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExportStatisticsModalComponent {
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

  public constructor(
    fb: FormBuilder,
    private readonly statisticsService: StatisticsService,
    private readonly fileService: FileService,
    private readonly modalCtrl: ModalController,
  ) {
    this.form = this.initFormGroup(fb);
  }

  /**
   * Handle 'submit' of the params form.
   * @param form Form group instance.
   */
  public onFormSubmit(form: FormGroup): void {
    form.markAllAsTouched();
    if (form.invalid) {
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
    this.modalCtrl.dismiss();
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

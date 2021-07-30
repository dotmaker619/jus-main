import { trigger, transition, style, animate } from '@angular/animations';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Matter } from '@jl/common/core/models';
import { TEntityValidationErrors } from '@jl/common/core/models/api-error';
import { DateTimePickerOptions } from '@jl/common/core/models/date-time-picker-options';
import { Invoice } from '@jl/common/core/models/invoice';
import { MatterStatus } from '@jl/common/core/models/matter-status';
import { catchValidationError } from '@jl/common/core/rxjs';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { MattersService } from '@jl/common/core/services/attorney/matters.service';
import { InvoiceService } from '@jl/common/core/services/invoice.service';
import { JusLawValidators } from '@jl/common/core/validators/validators';
import { AbstractDialog } from '@jl/common/shared/modules/dialogs/abstract-dialog';
import { Observable, Subject, combineLatest, ReplaySubject, BehaviorSubject, EMPTY, merge, of, NEVER } from 'rxjs';
import { shareReplay, first, map, switchMap, tap, mapTo, switchMapTo } from 'rxjs/operators';

interface EditInvoiceDialogOptions {
  /** Invoice to edit. */
  invoice?: Invoice;
  /** Title of a dialog. */
  title: string;
}

/** Dialog for editing the invoice. */
@Component({
  selector: 'jlc-edit-invoice',
  templateUrl: './edit-invoice-dialog.component.html',
  styleUrls: ['./edit-invoice-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger(
      'loadedAnimation', [
      transition('void => *', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 })),
      ]),
    ],
    ),
  ],
})
export class EditInvoiceDialogComponent extends AbstractDialog<EditInvoiceDialogOptions, boolean> {

  /** Is performing action. */
  public isBusy$ = new BehaviorSubject<boolean>(false);

  /** Invoice form. */
  public form$: Observable<FormGroup>;

  /** Validation errors subject. */
  public readonly validationError$ = new Subject<TEntityValidationErrors<Invoice>>();

  /** Datepicker options. */
  public readonly datePickerOptions: DateTimePickerOptions = {
    displayFormat: 'MM DD YYYY',
    placeholder: 'MM DD YYYY',
  };

  /** Options for matter select. */
  public readonly matterOptions$: Observable<Matter[]>;

  private propsInit$ = new ReplaySubject(1);

  /**
   * @constructor
   * @param invoiceService Invoice service.
   * @param matterService Matter service.
   * @param formBuilder Form builder.
   */
  public constructor(
    protected readonly invoiceService: InvoiceService,
    protected readonly matterService: MattersService,
    protected readonly formBuilder: FormBuilder,
  ) {
    super();
    this.matterOptions$ = this.initMatterOptions();
    this.form$ = this.initFormStream();
  }

  /** @inheritdoc */
  public afterPropsInit(): void {
    this.propsInit$.next();
  }

  /** Title of the dialog. */
  public get title(): string {
    return this.options && this.options.title;
  }

  /** Presented in options invoice. */
  public get invoice(): Invoice {
    return this.options && this.options.invoice;
  }

  /** Init matter options. */
  public initMatterOptions(): Observable<Matter[]> {
    return this.matterService.getMatters({
      statuses: [MatterStatus.Active],
      rateType: 'hourly',
    }).pipe(
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
  }

  /** Init form stream. */
  public initFormStream(): Observable<FormGroup> {
    const form = this.createForm();

    const fillForm$ = combineLatest([
      this.matterOptions$,
      this.propsInit$,
    ]).pipe(
      first(),
      tap(() => form.setValue({
        title: this.invoice ?
          this.invoice.title : null,
        matter: this.invoice ?
          this.invoice.matter.id :
          null,
        period: {
          start: this.invoice ? new Date(this.invoice.periodStart) : null,
          end: this.invoice ? new Date(this.invoice.periodEnd) : null,
        },
        note: this.invoice ?
          this.invoice.note : null,
      })),
      switchMapTo(NEVER),
    );
    return merge(of(form), fillForm$);
  }

  /** Create form for editing the invoice. */
  public createForm(): FormGroup {
    return this.formBuilder.group({
      title: [null, Validators.required],
      matter: [null, Validators.required],
      period: this.formBuilder.group({
        start: [null, [Validators.required]],
        end: [null, [Validators.required]],
      }, { validator: JusLawValidators.dateRange('start', 'end') }),
      note: [null],
    });
  }

  /**
   * Build an invoice out of form.
   * @param form Form.
   */
  public buildInvoiceStream(form: FormGroup): Observable<Invoice> {
    const val = form.value;
    return this.matterOptions$.pipe(
      map(matters => new Invoice({
        title: val.title,
        matter: matters.find(matter =>
          matter.id === val.matter,
        ),
        id: this.invoice && this.invoice.id,
        note: val.note,
        periodStart: val.period.start,
        periodEnd: val.period.end,
      })),
    );
  }

  /** Submit form. Save the invoice. */
  public onSubmit(form: FormGroup): void {
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }

    this.performSavingAction(form)
      .subscribe(() => {
        this.close(true);
      });
  }

  /**
   * Perform saving invoice action.
   * @param form Form group.
   */
  protected performSavingAction(form: FormGroup): Observable<void> {
    return this.buildInvoiceStream(form).pipe(
      first(),
      tap(() => this.isBusy$.next(true)),
      switchMap(invoice => {
        if (!!this.invoice) {
          return this.invoiceService.updateInvoice(invoice);
        }
        return this.invoiceService.createInvoice(invoice);
      }),
      first(),
      catchValidationError(({ validationData }) => {
        this.isBusy$.next(false);
        this.validationError$.next(validationData);
        return EMPTY;
      }),
      onMessageOrFailed(() => this.isBusy$.next(false)),
      mapTo(null),
    );
  }

  /** Close the dialog on cancel click. */
  public onCancelClicked(): void {
    this.close(null);
  }
}

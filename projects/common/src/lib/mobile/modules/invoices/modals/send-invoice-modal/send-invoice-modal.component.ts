import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { TEntityValidationErrors } from '@jl/common/core/models/api-error';
import { SendInvoice } from '@jl/common/core/models/send-invoice';
import { catchValidationError } from '@jl/common/core/rxjs';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { InvoiceService } from '@jl/common/core/services/invoice.service';
import { AlertService } from '@jl/common/mobile/services/alert.service';
import { Observable, BehaviorSubject, of, EMPTY, Subject, ReplaySubject, merge, NEVER } from 'rxjs';
import { switchMap, filter, tap, switchMapTo } from 'rxjs/operators';

/** Send invoice modal component. */
@Component({
  selector: 'jlc-send-invoice-modal',
  templateUrl: './send-invoice-modal.component.html',
  styleUrls: ['./send-invoice-modal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SendInvoiceModalComponent implements OnInit {
  /** Invoice id. */
  @Input()
  public invoiceId: number;
  /** A client email a user sends an invoice to. */
  @Input()
  public clientEmail: string;

  /** Validation errors for form. */
  public readonly validationError$ = new Subject<TEntityValidationErrors<SendInvoice>>();

  /** Form. */
  public readonly form$: Observable<FormGroup>;

  /** Is app loading. */
  public readonly isLoading$ = new BehaviorSubject<boolean>(false);

  /** Validators for dynamic emails list field. */
  public validatorsForDynamicListField = [
    Validators.required,
    Validators.email,
  ];

  private readonly init$ = new ReplaySubject<void>(1);

  /**
   * @constructor
   * @param invoiceService Invoice service.
   * @param modalController Modal controller.
   * @param formBuilder Form builder.
   * @param alertService Alert service.
   */
  public constructor(
    private readonly invoiceService: InvoiceService,
    private readonly modalController: ModalController,
    private readonly formBuilder: FormBuilder,
    private readonly alertService: AlertService,
  ) {
    this.form$ = this.initFormStream();
  }

  /** @inheritdoc */
  public ngOnInit(): void {
    this.init$.next();
  }

  /** Handles cancel button click. */
  public onCancelClick(): void {
    this.close();
  }

  /** Handle sumbit event. */
  public onSubmit(form: FormGroup): void {
    form.markAllAsTouched();
    if (form.invalid || this.isLoading$.value) {
      return;
    }

    this.isLoading$.next(true);
    this.invoiceService.sendInvoice(this.invoiceId, new SendInvoice({
      note: form.value.note,
      recipientList: form.value.recipientList,
    })).pipe(
      onMessageOrFailed(() => this.isLoading$.next(false)),
      catchValidationError(error => {
        this.validationError$.next(error.validationData);
        return EMPTY;
      }),
      switchMap(() => this.alertService.showNotificationAlert({
        header: 'Invoice sent',
        message: `A copy of the invoice has been sent to: ${
          form.value.recipientList.map(recipient => `<div>${recipient}</div>`).join('')}`,
      })),
    ).subscribe(() => this.close());
  }

  private close(): void {
    this.modalController.dismiss();
  }

  private initFormStream(): Observable<FormGroup> {
    const form = this.formBuilder.group({
      recipientList: [null, [
        Validators.required,
      ]],
      note: [null],
    });

    const fillRecipient$ = this.init$.pipe(
      filter(() => !!this.clientEmail),
      tap(() => form.patchValue({
        recipientList: [this.clientEmail],
      })),
      switchMapTo(NEVER),
    );

    return merge(of(form), fillRecipient$);
  }
}

import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TEntityValidationErrors } from '@jl/common/core/models/api-error';
import { Invoice } from '@jl/common/core/models/invoice';
import { SendInvoice } from '@jl/common/core/models/send-invoice';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { InvoiceService } from '@jl/common/core/services/invoice.service';
import { JusLawValidators } from '@jl/common/core/validators/validators';
import { AbstractDialog } from '@jl/common/shared';
import { BehaviorSubject, Observable, of, ReplaySubject, NEVER, merge, EMPTY } from 'rxjs';
import { take, finalize, filter, tap, switchMapTo, catchError } from 'rxjs/operators';

/** Send invoice dialog component */
@Component({
  selector: 'jlc-send-invoice-dialog',
  templateUrl: './send-invoice-dialog.component.html',
  styleUrls: ['./send-invoice-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SendInvoiceDialogComponent extends AbstractDialog<Invoice> {
  /** Send invoice form group */
  public readonly sendInvoiceForm$: Observable<FormGroup>;
  /** Validation error. */
  public readonly validationError$ = new BehaviorSubject<TEntityValidationErrors<SendInvoice>>(null);
  /** Is sending as observable */
  public readonly isSending$: Observable<boolean>;
  /** Sent invoice as observable */
  public readonly sentInvoice$: Observable<SendInvoice>;

  private readonly sentInvoice = new BehaviorSubject<SendInvoice>(null);
  private readonly isSending = new BehaviorSubject(false);
  private readonly propsInit$ = new ReplaySubject<void>(1);

  /** @constructor */
  public constructor(
    private invoiceService: InvoiceService,
  ) {
    super();

    this.sendInvoiceForm$ = this.initFormStream();
    this.isSending$ = this.isSending.asObservable();
    this.sentInvoice$ = this.sentInvoice.asObservable();
  }

  /** @inheritdoc */
  public afterPropsInit(): void {
    this.propsInit$.next();
  }

  /** On close click */
  public onCloseClick(): void {
    this.close();
  }

  /** On send click */
  public onSendClick(sendInvoiceForm: FormGroup): void {
    sendInvoiceForm.markAllAsTouched();

    if (sendInvoiceForm.invalid || this.isSending.value) {
      return;
    }

    const data = new SendInvoice({
      recipientList: sendInvoiceForm.value.to,
      note: sendInvoiceForm.value.note,
    });

    this.sendInvoice(this.options.id, data);
  }

  private sendInvoice(invoiceId: number, data: SendInvoice): void {
    this.isSending.next(true);

    this.invoiceService.sendInvoice(invoiceId, data)
      .pipe(
        take(1),
        onMessageOrFailed(() => this.isSending.next(false)),
        catchError((error) => {
          this.validationError$.next(error.validationData);
          return EMPTY;
        }),
      )
      .subscribe(() => this.sentInvoice.next(data));
  }

  private initFormStream(): Observable<FormGroup> {
    const form = new FormGroup({
      to: new FormControl([], [Validators.required]),
      note: new FormControl(''),
    });

    const fillRecipient$ = this.propsInit$.pipe(
      filter(() => !!this.options),
      tap(() => form.patchValue({
        to: [this.options.client.email],
      })),
      switchMapTo(NEVER),
    );

    return merge(of(form), fillRecipient$);
  }
}

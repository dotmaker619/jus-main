import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Invoice } from '@jl/common/core/models/invoice';
import { MattersService } from '@jl/common/core/services/attorney/matters.service';
import { InvoiceService } from '@jl/common/core/services/invoice.service';
import { AlertService } from '@jl/common/mobile/services/alert.service';
import { EditInvoiceDialogComponent } from '@jl/common/shared/components/edit-invoice-dialog/edit-invoice-dialog.component';
import { switchMap, first } from 'rxjs/operators';

/** Edit invoice modal component. */
@Component({
  selector: 'jlc-edit-invoice-modal',
  templateUrl: './edit-invoice-modal.component.html',
  styleUrls: ['./edit-invoice-modal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditInvoiceModalComponent extends EditInvoiceDialogComponent implements OnInit {
  /** Invoice. */
  @Input()
  public set invoice(i: Invoice) {
    this.invoiceValue = i;
  }

  // Overriding parent getters.
  /** Invoice. */
  public get invoice(): Invoice {
    return this.invoiceValue;
  }

  /** Title. */
  public get title(): string {
    return this.invoiceValue == null ? 'New Invoice' : 'Edit Invoice';
  }

  private invoiceValue: Invoice;

  /**
   * @constructor
   * @param invoiceService Invoice service.
   * @param matterService Matter service.
   * @param formBuilder Form builder.
   * @param modalController Modal controller.
   * @param alertService Alert service.
   */
  public constructor(
    protected readonly invoiceService: InvoiceService,
    protected readonly matterService: MattersService,
    protected readonly formBuilder: FormBuilder,
    private readonly modalController: ModalController,
    private readonly alertService: AlertService,
  ) {
    super(
      invoiceService,
      matterService,
      formBuilder,
    );
  }
  /** @inheritdoc */
  public ngOnInit(): void {
    super.afterPropsInit();
  }

  /** @inheritdoc */
  public onSubmit(form: FormGroup): void {
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }
    const action = this.invoice != null ? 'Edited' : 'Created';

    this.performSavingAction(form).pipe(
      first(),
      switchMap(() => this.alertService.showNotificationAlert({
        header: `Invoice ${action}`,
      })),
    ).subscribe(() => {
      this.close();
    });
  }

  /** @inheritdoc */
  public close(): void {
    this.modalController.dismiss();
  }
}

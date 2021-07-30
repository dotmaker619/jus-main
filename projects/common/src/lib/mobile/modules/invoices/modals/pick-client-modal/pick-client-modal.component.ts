import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { QuickbooksClient } from '@jl/common/core/models/quickbooks-client';
import { BasePickClientDialog } from '@jl/common/shared/base-components/invoices/pick-client-dialog.base';

/** Dialog to pick quickbooks client. */
@Component({
  selector: 'jlc-pick-client-modal',
  templateUrl: './pick-client-modal.component.html',
  styleUrls: ['./pick-client-modal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PickClientModalComponent extends BasePickClientDialog {

  /**
   * @constructor
   * @param formBuilder Form builder.
   */
  public constructor(
    readonly formBuilder: FormBuilder,
    private readonly modalController: ModalController,
  ) {
    super(formBuilder);
  }

  /**
   * Handle search query change.
   * @param form Form.
   * @param value Query value.
   */
  public onSearchQueryChange(form: FormGroup, value: string): void {
    form.controls.query.setValue(value);
  }

  /** @inheritdoc */
  public close(result?: QuickbooksClient): void {
    this.modalController.dismiss(result);
  }
}

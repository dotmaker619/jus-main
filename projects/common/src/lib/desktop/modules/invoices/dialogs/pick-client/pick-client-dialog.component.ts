import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePickClientDialog } from '@jl/common/shared/base-components/invoices/pick-client-dialog.base';

/** Dialog to pick quickbooks client. */
@Component({
  selector: 'jlc-pick-client-dialog',
  templateUrl: './pick-client-dialog.component.html',
  styleUrls: ['./pick-client-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PickClientDialogComponent extends BasePickClientDialog {
}

import { Component, ChangeDetectionStrategy } from '@angular/core';

import { AbstractDialog } from '../abstract-dialog';

/**
 * Success dialog options.
 */
export interface SuccessDialogOptions {
  /**
   * Title.
   */
  title: string;
  /**
   * Message.
   */
  message: string;
}

/**
 * Success dialog component.
 */
@Component({
  selector: 'jlc-success-dialog',
  templateUrl: './success-dialog.component.html',
  styleUrls: ['./success-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuccessDialogComponent extends AbstractDialog<SuccessDialogOptions> {
  /** Close dialog. */
  public onCloseClicked(): void {
    this.close();
  }
}

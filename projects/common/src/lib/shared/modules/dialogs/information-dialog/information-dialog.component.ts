import { Component, ChangeDetectionStrategy } from '@angular/core';

import { AbstractDialog } from '../abstract-dialog';

/**
 * Confirm dialog options.
 */
export interface InformationDialogOptions {
  /**
   * Title.
   */
  title: string;
  /**
   * Content message.
   */
  message: string;
}

/**
 * Base info dialog.
 */
@Component({
  selector: 'jlc-information-dialog',
  templateUrl: './information-dialog.component.html',
  styleUrls: ['./information-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InformationDialogComponent extends AbstractDialog<InformationDialogOptions> {
  /**
   * Close dialog.
   */
  public onCloseClicked(): void {
    this.close();
  }
}

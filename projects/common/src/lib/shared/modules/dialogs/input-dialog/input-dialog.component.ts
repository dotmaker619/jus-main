import { Component, ChangeDetectionStrategy } from '@angular/core';

import { AbstractDialog } from '../abstract-dialog';

/**
 * Input dialog options.
 */
export interface InputDialogOptions {
  /**
   * Title.
   */
  title: string;
  /**
   * Text as as a label of input.
   */
  inputLabelText: string;
  /**
   * Confirm button text.
   */
  confirmButtonText?: string;
  /**
   * Additional message.
   */
  message?: string;
  /**
   * Prefilled value.
   */
  value?: string;
}

/**
 * Dialog with single Input element.
 * Provides ability to enter a string value.
 */
@Component({
  selector: 'jlc-input-dialog',
  templateUrl: './input-dialog.component.html',
  styleUrls: ['./input-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputDialogComponent extends AbstractDialog<InputDialogOptions, string | null> {
  /** Close dialog. */
  public onCloseClicked(value?: string): void {
    this.close(value);
  }
}

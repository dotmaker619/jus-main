import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';

import { AbstractDialog } from '../abstract-dialog';

/**
 * Confirmation dialog options.
 */
export interface ConfirmationDialogOptions {
  /**
   * Title.
   */
  title: string;
  /**
   * Message.
   */
  message: string | SafeHtml;
  /**
   * Confirmation button text.
   */
  confirmationButtonText: string;
  /**
   * Confirmation button class.
   */
  confirmationButtonClass: 'primary' | 'secondary' | 'tertiary' | 'danger';
  /**
   * Cancel button text.
   */
  cancelButtonText: string;
}

/** Confirmation dialog component. */
@Component({
  selector: 'jlc-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationDialogComponent extends AbstractDialog<ConfirmationDialogOptions, boolean> {
  /** Cancel. */
  public onCloseClicked(): void {
    this.close(false);
  }

  /** Confirmation. */
  public onConfirmClicked(): void {
    this.close(true);
  }

  /**
   * Is content of dialog is a simple string.
   */
  public get isTextContent(): boolean {
    return typeof this.options.message === 'string';
  }
}

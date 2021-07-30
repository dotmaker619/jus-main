import { Component, ChangeDetectionStrategy } from '@angular/core';

import { AbstractDialog } from '../abstract-dialog';

/**
 * Error dialog options.
 */
export interface ErrorDialogOptions {
  /**
   * Title.
   * Default is "Error".
   */
  title?: string;
  /**
   * Message.
   * Default is "Something went wrong"
   */
  message?: string;
  /**
   * Error details.
   */
  error: Error | string;
}

/**
 * Error dialog component.
 */
@Component({
  selector: 'jlc-error-dialog',
  templateUrl: './error-dialog.component.html',
  styleUrls: ['./error-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorDialogComponent extends AbstractDialog<ErrorDialogOptions> {

  /**
   * Default title if options.title is not provided.
   */
  public defaultTitle = 'Error';

  /**
   * Default message if options.message is not provided.
   */
  public defaultMessage = 'Something went wrong. Please try later';

  /**
   * Error details.
   */
  public get errorDetails(): string {
    const { error } = this.options;
    if (typeof error === 'string') {
      return error;
    }
    if (error instanceof Error && error.stack != null) {
      return error.stack;
    }

    return `${error.name}: ${error.message}`;
  }

  /**
   * On "Close" button clicked.
   */
  public onCloseClicked(): void {
    this.close();
  }

  /**
   * On copy details clicked.
   */
  public onCopyDetailsClicked(): void {
    navigator.clipboard.writeText(this.errorDetails);
  }
}

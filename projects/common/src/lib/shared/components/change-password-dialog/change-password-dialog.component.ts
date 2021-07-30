import { Component, ChangeDetectionStrategy } from '@angular/core';

import { AbstractDialog } from '../../modules/dialogs/abstract-dialog';

/**
 * Change password dialog.
 */
@Component({
  selector: 'jlc-change-password-dialog',
  templateUrl: './change-password-dialog.component.html',
  styleUrls: ['./change-password-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangePasswordDialogComponent extends AbstractDialog<never, boolean> {
  /**
   * On "Change password" cancelled.
   */
  public onCancelled(): void {
    this.close(false);
  }

  /**
   * On password successfully changed.
   */
  public onPasswordChanged(): void {
    this.close(true);
  }
}

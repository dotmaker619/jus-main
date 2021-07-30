import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Note } from '@jl/common/core/models/note';
import { AbstractDialog } from '@jl/common/shared';

import { DialogsService } from '../../../../../shared/modules/dialogs/dialogs.service';

/**
 * View note dialog options.
 */
export interface ViewNoteDialogOptions {
  /** Note. */
  note: Note;
  /** Is view mode. */
  isViewMode: boolean;
}

/**
 * View note dialog result.
 */
export enum ViewNoteDialogResult {
  /** Edit note. */
  Edit = 0,
  /** Delete note. */
  Delete,
  /** Do nothing. */
  None = undefined,
}

/** View note dialog. */
@Component({
  selector: 'jlc-view-note-dialog',
  templateUrl: './view-note-dialog.component.html',
  styleUrls: ['./view-note-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewNoteDialogComponent extends AbstractDialog<ViewNoteDialogOptions, ViewNoteDialogResult> {

  /**
   * @constructor
   *
   * @param dialogService Dialogs service.
   */
  public constructor(
    private dialogService: DialogsService,
  ) {
    super();
  }

  /** Note. */
  public get note(): Note {
    return this.options.note;
  }

  /** Is matter not editable */
  public get isViewMode(): boolean {
    return this.options.isViewMode;
  }

  /** Close dialog with Edit option. */
  public onEditClicked(): void {
    this.close(ViewNoteDialogResult.Edit);
  }

  /** Close dialog with Delete option. */
  public async onDeleteClicked(): Promise<void> {
    const agreed = await this.dialogService.showConfirmationDialog({
      message: `Are you sure you want to delete ${this.note.title}?`,
      title: `Delete ${this.note.title}?`,
      confirmationButtonClass: 'danger',
      confirmationButtonText: 'Delete',
    });
    if (agreed) {
      this.close(ViewNoteDialogResult.Delete);
    }
  }

  /** Close dialog. */
  public onCloseClicked(): void {
    this.close(ViewNoteDialogResult.None);
  }

}

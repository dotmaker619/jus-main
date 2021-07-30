import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { Note } from '@jl/common/core/models/note';
import { NotesService } from '@jl/common/core/services/attorney/notes.service';
import { AlertService } from '@jl/common/mobile/services/alert.service';
import { from } from 'rxjs';
import { switchMap, filter, first } from 'rxjs/operators';

import { EditNoteModalComponent } from '../edit-note-modal/edit-note-modal.component';

/** Component displaying matter note. Used in mobile workspace. */
@Component({
  selector: 'jlc-show-note-modal',
  templateUrl: './show-note-modal.component.html',
  styleUrls: ['./show-note-modal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowNoteModalComponent {
  /** Note. */
  @Input()
  public note: Note;

  /** Is note editable. */
  @Input()
  public editable = false;

  /** Default avatar image. */
  public fallbackAvatarUrl = '/assets/icons/mobile_avatar.svg';

  /**
   * @constructor
   * @param actionSheetController Action sheet controller.
   * @param alertService Alert service.
   * @param notesService Notes service.
   * @param modalController Modal controller.
   */
  public constructor(
    private readonly actionSheetController: ActionSheetController,
    private readonly alertService: AlertService,
    private readonly notesService: NotesService,
    private readonly modalController: ModalController,
  ) { }

  /** Open action sheet. */
  public async onMoreButtonClick(): Promise<void> {
    const actionSheet = await this.actionSheetController.create({
      buttons: [
        {
          text: 'Edit Note',
          handler: () => { this.openEditingNoteModal(); },
        },
        {
          text: 'Delete Note',
          role: 'destructive',
          handler: () => this.deleteNote(),
        },
        {
          text: 'Cancel',
          role: 'cancel',
        },
      ],
    });

    actionSheet.present();
  }

  /** Open modal for editing the note. */
  public async openEditingNoteModal(): Promise<void> {
    const modal = await this.modalController.create({
      component: EditNoteModalComponent,
      componentProps: {
        note: this.note,
      },
    });
    await modal.present();
    const result = await modal.onDidDismiss();

    /**
     * onDidDismiss doesn't really wait for the closing of the modal.
     * so we need to call dismiss ourselves.
     * Otherwise, this.close() method doesn't work well because modalController.dismiss() closes only top-overlay modal,
     * which is EditNoteModalComponent in this case.
     */
    await modal.dismiss();
    // If changes happened on child modal - close this.
    if (result.data) {
      this.close();
    }
  }

  /** Delete note. */
  public deleteNote(): void {
    from(this.alertService.showConfirmation({
      message: 'Are you sure you want to delete the note?',
      isDangerous: true,
    })).pipe(
      filter(shouldDelete => shouldDelete),
      switchMap(() => this.notesService.deleteNote(this.note.id)),
      first(),
      switchMap(() => this.alertService.showNotificationAlert({
        header: 'Note Deleted',
      })),
    ).subscribe(() => this.close());
  }

  /** On cancel clicked. */
  public onCancelClicked(): void {
    this.close();
  }

  private close(): void {
    this.modalController.dismiss();
  }
}

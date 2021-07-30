import { Component, ChangeDetectionStrategy, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { Note } from '@jl/common/core/models/note';
import { Pagination } from '@jl/common/core/models/pagination';

import { ShowNoteModalComponent } from '../../modals/show-note-modal/show-note-modal.component';

const INITIAL_NOTES_NUM = 3;

/** Notes list component for mobile workspace. */
@Component({
  selector: 'jlc-notes-list',
  templateUrl: './notes-list.component.html',
  styleUrls: ['./notes-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotesListComponent implements OnInit {

  /** Notes. */
  @Input()
  public notes: Pagination<Note>;

  /** Are notes editable. */
  @Input()
  public editable = false;

  /** Notes limit change. */
  @Output()
  public notesLimitChange = new EventEmitter<number>();

  /**
   * @constructor
   * @param modalController Modal controller.
   */
  public constructor(
    private readonly modalController: ModalController,
  ) { }

  /** Is list expandable. */
  public get isExpandable(): boolean {
    return this.notes.itemsCount > this.notes.items.length;
  }

  /** @inheritdoc */
  public ngOnInit(): void {
    // Request initial number of notes.
    this.notesLimitChange.next(INITIAL_NOTES_NUM);
  }

  /** On fold click. */
  public onFoldClick(): void {
    this.notesLimitChange.next(INITIAL_NOTES_NUM);
  }

  /** On unfold click. */
  public onExpandClick(): void {
    this.notesLimitChange.next(this.notes.itemsCount);
  }

  /** Should fold button be displayed. */
  public get shouldDisplayFoldButton(): boolean {
    return this.notes.items.length > INITIAL_NOTES_NUM;
  }

  /** Should expand button be displayed. */
  public get shouldDisplayExpandButton(): boolean {
    return this.notes.itemsCount > this.notes.items.length;
  }

  /**
   * Trackby function.
   * @param _ Idx.
   * @param note Note.
   */
  public trackByNote(_: number, note: Note): number {
    return note.id;
  }

  /** Open note modal. */
  public async openNote(note: Note): Promise<void> {
    const modal = await this.modalController.create({
      component: ShowNoteModalComponent,
      componentProps: {
        note,
        editable: this.editable,
      },
    });

    modal.present();
  }
}

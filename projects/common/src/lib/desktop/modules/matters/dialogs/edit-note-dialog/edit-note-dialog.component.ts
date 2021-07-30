import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Note } from '@jl/common/core/models/note';
import { NotesService } from '@jl/common/core/services/attorney/notes.service';
import { AbstractDialog } from '@jl/common/shared';
import { Subject, Observable } from 'rxjs';
import { first, finalize } from 'rxjs/operators';

/**
 * Add note dialog options.
 */
export interface EditNoteDialogOptions {
  /** Matter id. */
  matterId?: number;

  /** Note. */
  note?: Note;
}

/** Add note dialog component. */
@Component({
  selector: 'jlc-edit-note-dialog',
  templateUrl: './edit-note-dialog.component.html',
  styleUrls: ['./edit-note-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditNoteDialogComponent extends AbstractDialog<EditNoteDialogOptions, void> implements OnInit {

  /** Matter id. */
  public get matterId(): number {
    return this.options.matterId;
  }

  /** Get initial note. */
  public get note(): Note {
    return this.options.note;
  }

  /** @constructor */
  public constructor(
    private notesService: NotesService,
    public fb: FormBuilder,
  ) {
    super();
  }

  /**
   * Get dialog title 'Edit' or 'Add' based on existence of Note.
   */
  public get dialogTitle(): string {
    if (this.note) {
      return `Edit ${this.note.title}`;
    }

    return 'Add Note';
  }

  /** Is request emitting. */
  public isLoading$ = new Subject<boolean>();

  /** Note form group. */
  public noteFormGroup = this.fb.group({
    text: [null, [Validators.required]],
    title: [null, [Validators.required]],
  });

  /** Fill the form is note is presented. */
  public ngOnInit(): void {
    if (this.note) {
      this.noteFormGroup.controls.text.setValue(this.note.text);
      this.noteFormGroup.controls.title.setValue(this.note.title);
    }
  }

  /** Close modal. */
  public onCloseClick(): void {
    this.close();
  }

  /** Save note. */
  public onSaveClick(): void {
    this.noteFormGroup.markAllAsTouched();
    if (this.noteFormGroup.valid) {
      this.isLoading$.next(true);
      let request$: Observable<void | Note>;

      if (this.note) {
        // If note is presented - change it.
        const newNote = {
          text: this.noteFormGroup.controls.text.value,
          title: this.noteFormGroup.controls.title.value,
        } as Note;

        request$ = this.notesService.editNote({ id: this.note.id, ...newNote });

      } else if (this.matterId) {
        // Otherwise - create new note.
        const note = {
          text: this.noteFormGroup.controls.text.value,
          title: this.noteFormGroup.controls.title.value,
          matter: { id: this.matterId },
        } as Note;

        request$ = this.notesService.saveNote(note);

      } else {
        console.warn('Neither matterId nor Note wasn\'t obtained in EditNoteDialog!');
      }

      // Finalize request
      request$.pipe(
        first(),
        finalize(() => this.isLoading$.next(false)),
      ).subscribe(() => this.close());
    }
  }
}

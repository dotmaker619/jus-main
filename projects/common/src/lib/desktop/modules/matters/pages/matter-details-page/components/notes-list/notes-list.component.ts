import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { Matter } from '@jl/common/core/models/matter';
import { MatterStatus } from '@jl/common/core/models/matter-status';
import { Note } from '@jl/common/core/models/note';
import { NotesService } from '@jl/common/core/services/attorney/notes.service';
import { DialogsService } from '@jl/common/shared';
import { Observable, EMPTY, combineLatest, BehaviorSubject } from 'rxjs';
import { startWith, switchMap, tap, map, first } from 'rxjs/operators';

import { EditNoteDialogComponent } from '../../../../dialogs/edit-note-dialog/edit-note-dialog.component';
import { ViewNoteDialogComponent, ViewNoteDialogResult } from '../../../../dialogs/view-note-dialog/view-note-dialog.component';

/** Notes list component. */
@Component({
  selector: 'jlc-notes-list',
  templateUrl: './notes-list.component.html',
  styleUrls: ['./notes-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotesListComponent implements OnInit {

  /** Matter. */
  @Input()
  public matter: Matter;

  /** Outer change event. */
  @Input()
  public change$: Observable<void> = EMPTY;

  /** Default number of rows in notes list. */
  @Input()
  public rowsNumber = 10;

  /** Emit number of notes outside of a component. */
  @Output()
  public notesNumberChange = new EventEmitter<number>();

  /** Shows whether the table is unfolded */
  public tableUnfold$ = new BehaviorSubject<boolean>(false);

  /** Notes. */
  public notes$: Observable<Note[]>;

  /**
   * @constructor
   * @param notesService Notes service.
   */
  public constructor(
    private notesService: NotesService,
    private dialogService: DialogsService,
  ) {}

  /** Init notes. */
  public ngOnInit(): void {

    const notesChange$ = combineLatest([
      this.tableUnfold$,
      this.change$.pipe(startWith(undefined)),
    ]);

    this.notes$ = notesChange$.pipe(
      switchMap(() => this.notesService.getNotes(this.matter.id, this.rowsNumber)),
      tap(({itemsCount}) => {
        this.notesNumberChange.next(itemsCount);
      }),
      map((pagination) => pagination.items),
    );
  }

  /** Show all the rows in table. */
  public changeRowsNumber(num: number): void {
    this.rowsNumber = num;
    this.tableUnfold$.next(true);
  }

  /**
   * Track by note function.
   * @param note
   */
  public trackByNoteId(_: number, note: Note): number {
    return note.id;
  }

  /**
   * Open modal with description note.
   * @param note Note.
   */
  public async onNoteClick(note: Note): Promise<void> {
    const isMatterCompleted = this.matter.status === MatterStatus.Completed;

    const viewNoteResult = await this.dialogService.openDialog(ViewNoteDialogComponent, {
      isViewMode: isMatterCompleted,
      note,
    });
    if (viewNoteResult === ViewNoteDialogResult.Delete) {
      this.notesService.deleteNote(note.id).pipe(first()).subscribe(() => {
        // Emit notes change.
        this.changeRowsNumber(this.rowsNumber);
      });
    } else if (viewNoteResult === ViewNoteDialogResult.Edit) {
      this.dialogService.openDialog(EditNoteDialogComponent, {note}).then(() => {
        // Emit rows change to update current notes.
        this.changeRowsNumber(this.rowsNumber);
      });
    }
  }
}

import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Note } from '@jl/common/core/models/note';

/** Note item component. */
@Component({
  selector: 'jlc-note-item',
  templateUrl: './note-item.component.html',
  styleUrls: ['./note-item.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoteItemComponent {
  /** Note. */
  @Input()
  public note: Note;
}

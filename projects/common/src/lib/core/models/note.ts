import { Client } from './client';
import { Matter } from './matter';

/** Note model. */
export class Note {
  /** Id. */
  public id: number;
  /** Title. */
  public title: string;
  /** Text. */
  public text: string;
  /** Matter. */
  public matter: Matter;
  /** Client who created the note. */
  public createdBy: Client;
  /** Date of creation. */
  public created: Date;
  /** Date of modification. */
  public modified: Date;

  /**
   * @constructor
   * @param note Note.
   */
  public constructor(note: Partial<Note>) {
    this.id = note.id;
    this.title = note.title;
    this.text = note.text;
    this.matter = note.matter;
    this.createdBy = note.createdBy;
    this.created = note.created;
    this.modified = note.modified;
  }
}

/** Specialty model. */
export class Specialty {
  /** Id */
  public id: number;
  /** Title */
  public title: string;

  constructor(specialty: Partial<Specialty>) {
    this.id = specialty.id;
    this.title = specialty.title;
  }
}

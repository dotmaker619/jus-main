/** Closing checklist model. */
export class ChecklistOption {
  /** Id */
  public id: number;
  /** Description */
  public description: string;

  /**
   * @constructor
   * @param closingChecklist
   */
  public constructor(closingChecklist: Partial<ChecklistOption>) {
    this.id = closingChecklist.id;
    this.description = closingChecklist.description;
  }
}

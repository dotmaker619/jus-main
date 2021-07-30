import { Matter } from './matter';
import { User } from './user';

/** Time billing dto model. */
export class TimeBilling {
  /** Id */
  public id: number;
  /** Matter */
  public matter: Matter;
  /** Invoice */
  public invoice: number;
  /** Description */
  public description: string;
  /** Time spent in minutes */
  public spentMinutes: number;
  /** Amount of money should be paid for a spent time */
  public fees: string;
  /** Date in which billed work was made */
  public date: string;
  /** Created */
  public created: string;
  /** Modified */
  public modified: string;
  /** User who made bill. */
  public createdBy: User;
  /** Can billing log be edited. */
  public isEditable: boolean;
  /** Can billing log be edited by the current user. */
  public isEditableForCurrentUser: boolean;

  /**
   * @constructor
   * @param data
   */
  public constructor(data: Partial<TimeBilling>) {
    this.id = data.id;
    this.matter = data.matter;
    this.invoice = data.invoice;
    this.description = data.description;
    this.spentMinutes = data.spentMinutes;
    this.fees = data.fees;
    this.date = data.date;
    this.created = data.created;
    this.modified = data.modified;
    this.createdBy = data.createdBy;
    this.isEditable = data.isEditable;
    this.isEditableForCurrentUser = data.isEditableForCurrentUser || false;
  }
}

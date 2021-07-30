interface MatterData {
  /** Id */
  id: number;
  /** Code */
  code: string;
  /** Title */
  title: string;
  /** Description */
  description: string;
}

/** Activity model. */
export class Activity {
  /** Id */
  public id: number;
  /** Title */
  public title: string;
  /** Matter */
  public matter: number;
  /** Matter data */
  public matterData: MatterData;
  /** Created */
  public created: string;
  /** Modified */
  public modified: string;

  /**
   * @constructor
   * @param activity
   */
  public constructor(activity: Partial<Activity>) {
    this.id = activity.id;
    this.title = activity.title;
    this.matter = activity.matter;
    this.matterData = activity.matterData;
    this.created = activity.created;
    this.modified = activity.modified;
  }
}

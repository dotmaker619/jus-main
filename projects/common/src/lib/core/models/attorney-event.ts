import { EventLocation } from './event-location';

/** Event model. */
export class AttorneyEvent {
  /** ID */
  public id: number;
  /** Attorney ID */
  public attorneyId: number;
  /** Title */
  public title: string;
  /** Description */
  public description: string;
  /** Is event is all day */
  public isAllDay: boolean;
  /** Start date-time */
  public start: Date;
  /** End date-time */
  public end: Date;
  /** Duration */
  public duration: string;
  /** Location */
  public location: EventLocation;

  /**
   * @constructor
   * @param attorneyEvent
   */
  public constructor(attorneyEvent: Partial<AttorneyEvent>) {
    this.id = attorneyEvent.id;
    this.attorneyId = attorneyEvent.attorneyId;
    this.title = attorneyEvent.title;
    this.description = attorneyEvent.description;
    this.isAllDay = attorneyEvent.isAllDay;
    this.start = attorneyEvent.start;
    this.end = attorneyEvent.end;
    this.duration = attorneyEvent.duration;
    this.location = attorneyEvent.location;
  }
}

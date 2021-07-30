const DEFAULT_TIMEZONE = 'local';

/**
 * Event location.
 * Describe location of an event.
 */
export class EventLocation {
  /**
   * Location name.
   */
  public name: string;

  /**
   * Timezone of location.
   * Is required to display a date/time in timezone of event location.
   */
  public timezone: string = DEFAULT_TIMEZONE;

  /**
   * @constructor
   * @param data Initialized data.
   */
  public constructor(data: Partial<EventLocation>) {
    this.name = data.name;
    this.timezone = data.timezone || DEFAULT_TIMEZONE;
  }
}

/** Attorney event dto. */
export interface AttorneyEventDto {
  /** Id */
  id: number;
  /** Attorney */
  attorney: number;
  /** Title */
  title: string;
  /** Description */
  description: string;
  /** Is event is all day */
  is_all_day: boolean;
  /** Start date-time */
  start: string;
  /** End date-time */
  end: string;
  /** Duration */
  duration: string;
  /** Location */
  location: string;
}

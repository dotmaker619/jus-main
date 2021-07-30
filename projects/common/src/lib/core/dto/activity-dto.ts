interface MatterDataDto {
  /** Id */
  id: number;
  /** Code */
  code: string;
  /** Title */
  title: string;
  /** Description */
  description: string;
}

/** Activity dto model. */
export interface ActivityDto {
  /** Id */
  id: number;
  /** Title */
  title: string;
  /** Matter */
  matter: number;
  /** Matter data */
  matter_data: MatterDataDto;
  /** Created */
  created: string;
  /** Modified */
  modified: string;
}

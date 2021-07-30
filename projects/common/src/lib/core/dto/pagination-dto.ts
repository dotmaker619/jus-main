/** Pagination model. */
export interface PaginationDto<T> {
  /** Number of pages. */
  count: number;

  /** Url for the next page. */
  next: string;

  /** Url for the previous page. */
  previous: string;

  /** Results. */
  results: T[];
}

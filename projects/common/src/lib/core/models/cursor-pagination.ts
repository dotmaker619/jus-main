/** Cursor pagination model. */
export interface CursorPagination<T> {
  /** Items on a page. */
  readonly items: T[];
  /** Next page has items. */
  readonly next: boolean;
  /** Previous page has items. */
  readonly prev: boolean;
  /** Position where the page should be concatenated. */
  readonly position: 'tail' | 'head';
}

export type CursorPaginationDirection = 'head' | 'tail';

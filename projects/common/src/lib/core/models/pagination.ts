/** Pagination model. */
export interface Pagination<T> {
  /** Number of elements. */
  itemsCount: number;

  /** Number of pages. */
  pagesCount?: number;

  /** Current page. */
  page?: number;

  /** Result. */
  items: T[];
}

/** Base search params. */
export interface SearchParams {
  /** Page. */
  page?: number;
  /** Query. */
  query?: string;
  /** Count of items per page. */
  itemsPerPage?: number;
}

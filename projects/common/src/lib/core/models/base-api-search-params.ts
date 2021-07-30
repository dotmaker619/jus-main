/**
 * Base query params for GET requests
 */
export interface BaseApiSearchParams {
  /** Which field will be used for ordering */
  ordering?: string;
  /** Limit of entities to search */
  limit?: number;
  /** Search offset. */
  page?: number;
  /** A search term. */
  search?: string;
}

/** That may be ordered. */
export interface OrderableRequestParams {
  /** Which field to use when ordering the results. */
  ordering?: string;
}

/** Capable of being searched. */
export interface SearchableRequestParams {
  /** A search term. */
  search?: string;
}

/** That can be paged. */
export interface PageableRequestParams {
  /** Number of results to return per page. */
  limit?: number;
  /** The initial index from which to return the results. */
  offset?: number;
}

/** Default Jus-Law API request params. */
export interface DefaultRequestParams extends OrderableRequestParams, SearchableRequestParams, PageableRequestParams {}

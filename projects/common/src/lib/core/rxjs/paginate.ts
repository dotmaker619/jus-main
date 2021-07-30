import { Observable, of } from 'rxjs';
import { mapTo, startWith, scan, switchMapTo } from 'rxjs/operators';

/**
 * Pagination helper.
 * @param nextPageRequested$ Hot observable that emits when page is requested.
 * @param pageReset$ Observable that emits when we want to reset pagination to 0.
 * @returns Page change observable.
 * @example
 *
 * const wantMore$ = new Subject<void>();
 * const queryChange$ = new Subject<void>();
 *
 * const paginationData$ = paginate(
 *    wantMore$,
 *    queryChange$,
 *  ).pipe(
 *    withLatestFrom(queryChange$),
 *    switchMap(([page, query]) =>
 *      someService.searchForSomething({ query, page })),
 *  );
 *
 * paginationData$.subscribe(console.log);
 *
 * queryChange$.next(); // prints data on 0 page
 * wantMore$.next(); // prints data on 1st page
 * queryChange.next(); // prints data on 0 page
 */
export function paginate(
  nextPageRequested$: Observable<void>,
  pageReset$: Observable<void> = of(null),
): Observable<number> {
  const pageAccumulation$ = nextPageRequested$.pipe(
    mapTo(1), // Set number of requested pages on every emit
    startWith(0), // Set initial page
    scan(((curPage: number, requestedPages: 1) => curPage + requestedPages)),
  );
  return pageReset$.pipe(
    switchMapTo(pageAccumulation$),
  );
}

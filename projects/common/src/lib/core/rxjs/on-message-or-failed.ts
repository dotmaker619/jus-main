import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

/**
 * Operator emits callback on every stream message or error.
 * @param callback Callback.
 * @example observable.pipe(onMessageOrFailed(() => ...));
 */
export const onMessageOrFailed = <T>(callback: Function) =>
  (source$: Observable<T>) => source$
    .pipe(
      tap(() => callback()),
      catchError(e => {
        callback();
        return throwError(e);
      }),
    );

import { MonoTypeOperatorFunction, throwError, ObservableInput } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ApiValidationError } from '../models/api-error';

/**
 * Catch Api Validation Error operator.
 * Catches only ApiValidationError<T> errors.
 * @param callback s
 */
export function catchValidationError<T, O extends ObservableInput<any>, TEntity extends object = T extends object ? T : object>(
  selector: (error: ApiValidationError<TEntity>) => O): MonoTypeOperatorFunction<T> {
  return catchError(error => {
    if (error instanceof ApiValidationError) {
      return selector(error);
    }
    return throwError(error);
  });
}

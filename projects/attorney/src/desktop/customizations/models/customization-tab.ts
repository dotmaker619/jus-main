import { Observable } from 'rxjs/internal/Observable';

/** Customization tab. */
export interface CustomizationTab<T> {
  /** Id. */
  id: string;
  /** Title. */
  title: string;
  /** Button new title. */
  buttonTitle: string;
  /** List. */
  list$?: Observable<T[]>;
}

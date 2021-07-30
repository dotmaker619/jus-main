import { OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Destroyable base.
 */
export class DestroyableBase implements OnDestroy {

  /**
   * Component destroy.
   */
  protected readonly destroy$ = new Subject<void>();

  /**
   * @inheritdoc
   */
  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

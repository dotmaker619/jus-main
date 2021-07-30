import { EventEmitter, HostListener } from '@angular/core';

/**
 * Abstract base dialog
 */
export abstract class AbstractDialog<TOptions = never, TResult = void> {
  /** Dialog state. */
  public state: 'opened' | 'closed' = 'closed';

  /** Emitter for closing event. */
  public closed = new EventEmitter<TResult>();

  /**
   * Dialog options.
   */
  public options?: TOptions;

  /** Close the dialog on ESC press. */
  @HostListener('document:keydown.escape')
  public onKeydownHandler(): void {
    this.close();
  }

  /**
   * Open dialog.
   */
  public open(): void {
    this.state = 'opened';
  }

  /** Hook called after initialization of all properties. */
  public afterPropsInit(): void { }

  /**
   * Close dialog.
   * @param result Result data of dialog.
   */
  public close(result?: TResult): void {
    this.state = 'closed';
    this.closed.next(result);
  }
}

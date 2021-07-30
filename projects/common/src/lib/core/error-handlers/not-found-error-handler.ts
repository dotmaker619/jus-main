import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, NgZone, Injector } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Handler for navigation after getting 404 error.
 */
export class NotFoundErrorHandler implements ErrorHandler {

  /** Router instance. */
  private get router(): Router {
    return this.injector.get(Router);
  }

  /*
    Angular cannot inject router directly since we provide the handler to AppModule.
     Hence we need to use Injector to get a router instance.
  */
  /**
   * @constructor
   * @param injector Injector
   * @param ngZone Zone.
   */
  public constructor(
    private readonly injector: Injector,
    private readonly ngZone: NgZone,
  ) { }

  /** @inheritdoc */
  public handleError(error: unknown): void {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 404) {
        /*
         ErrorHandler is executed outside zone by default
          but angular router should work inside it.
        */
        this.ngZone.run(() => this.router.navigateByUrl('/not-found'));
      }
    }
    console.error(error);
  }
}

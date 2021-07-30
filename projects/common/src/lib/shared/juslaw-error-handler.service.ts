import { ErrorHandler, Injectable, Inject, forwardRef, Injector } from '@angular/core';

import { DialogsService } from './modules/dialogs/dialogs.service';
import { ErrorDialogComponent, ErrorDialogOptions } from './modules/dialogs/error-dialog/error-dialog.component';

/**
 * Just law application custom error handler.
 */
@Injectable()
export class JusLawErrorHandler implements ErrorHandler  {
  /**
   * @constructor
   * @param injector Injector to get necessary services and prevent circular dependencies.
   */
  constructor(private injector: Injector) {
  }

  /**
   * @inheritdoc
   */
  public handleError(error: any): void {
    try {
      const dialogsService = this.injector.get(DialogsService);

      const options: ErrorDialogOptions = {
        error,
      };
      dialogsService.openDialog(ErrorDialogComponent, options, { zIndex: 10 }); // Display with high zIndex to display on top.
    } catch (createDialogError) {
      // Could not create a dialog because it's not registered e.g.
      // Just display the error to console.
      console.error('Could not create error dialog', createDialogError);
      console.error('Original error', error);
    }
  }
}

import { Injectable } from '@angular/core';
import { UrlTree, CanDeactivate } from '@angular/router';
import { DeactivateFormComponent } from '@jl/common/core/forms/deactivate-form-component';
import { DialogsService } from '@jl/common/shared';
import { Observable } from 'rxjs';

const DIALOG_OPTIONS = {
  title: 'Attention',
  message: 'Are you sure want to leave this page? Your data will be lost.',
  confirmationButtonText: 'Yes',
};

/**
 * Show confirm dialog if the user tries to leave from the page where he has a form without saved data.
 */
@Injectable({
  providedIn: 'root',
})
export class CanLeavePageGuard implements CanDeactivate<DeactivateFormComponent> {
  /**
   * @constructor
   *
   * @param dialogsService Dialogs service.
   */
  public constructor(
    private readonly dialogsService: DialogsService,
  ) {
  }

  /**
   * @inheritdoc
   */
  public canDeactivate(component: DeactivateFormComponent): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (!component.canDeactivate) {
      return this.dialogsService.showConfirmationDialog(DIALOG_OPTIONS).then(result => result);
    }
    return true;
  }
}

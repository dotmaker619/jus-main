import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { DialogContainerComponent } from './dialog-container/dialog-container.component';
import { DialogContentComponent } from './dialog-content/dialog-content.component';
import { DialogHeaderComponent } from './dialog-header/dialog-header.component';
import { DialogsService } from './dialogs.service';
import { ErrorDialogComponent } from './error-dialog/error-dialog.component';
import { InformationDialogComponent } from './information-dialog/information-dialog.component';
import { InputDialogComponent } from './input-dialog/input-dialog.component';
import { LoginRequiredDialogComponent } from './login-required-dialog/login-required-dialog.component';
import { SuccessDialogComponent } from './success-dialog/success-dialog.component';

/**
 * Dialogs module.
 */
@NgModule({
  providers: [DialogsService],
  declarations: [
    InformationDialogComponent,
    SuccessDialogComponent,
    LoginRequiredDialogComponent,
    InputDialogComponent,
    DialogHeaderComponent,
    DialogContentComponent,
    DialogContainerComponent,
    ConfirmationDialogComponent,
    ErrorDialogComponent,
  ],
  exports: [
    DialogHeaderComponent,
    DialogContentComponent,
  ],
  entryComponents: [
    InformationDialogComponent,
    SuccessDialogComponent,
    LoginRequiredDialogComponent,
    InputDialogComponent,
    DialogContainerComponent,
    ConfirmationDialogComponent,
    ErrorDialogComponent,
  ],
  imports: [
    CommonModule,
  ],
})
export class DialogsModule { }

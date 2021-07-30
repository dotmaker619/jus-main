import { DOCUMENT } from '@angular/common';
import {
  Injectable,
  Injector,
  ApplicationRef,
  ComponentFactoryResolver,
  Type,
  Inject,
} from '@angular/core';
import { first } from 'rxjs/operators';

import { AbstractDialog } from './abstract-dialog';
import { ConfirmationDialogOptions, ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { DialogContainerComponent } from './dialog-container/dialog-container.component';
import { InformationDialogComponent, InformationDialogOptions } from './information-dialog/information-dialog.component';
import { InputDialogComponent, InputDialogOptions } from './input-dialog/input-dialog.component';
import { LoginRequiredDialogComponent, LoginRequiredDialogOptions } from './login-required-dialog/login-required-dialog.component';
import { SuccessDialogComponent, SuccessDialogOptions } from './success-dialog/success-dialog.component';

/**
 * Dialog display options.
 */
export interface DialogDisplayOptions {
  /**
   * z-index value.
   */
  zIndex?: number;
}

/**
 * Dialogs service.
 * Provides functionality to work with dialogs.
*/
@Injectable({
  providedIn: 'root',
})
export class DialogsService {
  constructor(
    private injector: Injector,
    private applicationRef: ApplicationRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    @Inject(DOCUMENT) private document: Document,
  ) { }

  /** Shows confirm with secondary button. */
  public showInformationDialog({
    title = '',
    message = '',
  }: InformationDialogOptions): Promise<void> {
    return this.openDialog(InformationDialogComponent, {
      title,
      message,
    });
  }

  /** Shows confirm with secondary button. */
  public showValidationError(): Promise<void> {
    return this.showInformationDialog({ title: 'Registration error', message: 'There are some errors in validation' });
  }

  /**
   * Shows confirm with success icon.
   */
  public showSuccessDialog({
    title = '',
    message = '',
  }: SuccessDialogOptions): Promise<void> {
    return this.openDialog(SuccessDialogComponent, {
      message,
      title,
    });
  }

  /** Shows confirm with buttons that redirect user to login/register page. */
  public showRedirectDialog(options?: LoginRequiredDialogOptions): Promise<void> {
    return this.openDialog(LoginRequiredDialogComponent, options);
  }

  /** Shows dialog with input. */
  public showInputDialog({
    title = '',
    inputLabelText = '',
    confirmButtonText = 'Register',
    message = '',
    value = '',
  }: InputDialogOptions): Promise<string> {
    return this.openDialog(InputDialogComponent, {
      title,
      inputLabelText,
      confirmButtonText,
      message,
      value,
    });
  }

  /** Shows dialog with input. */
  public showConfirmationDialog({
    title = '',
    message = '',
    confirmationButtonText = 'OK',
    confirmationButtonClass = 'primary',
    cancelButtonText = 'Cancel',
  }: Partial<ConfirmationDialogOptions>): Promise<boolean> {
    return this.openDialog(ConfirmationDialogComponent, {
      title,
      message,
      confirmationButtonText,
      confirmationButtonClass,
      cancelButtonText,
    });
  }

  /**
   * Creates popup and adds it to DOM.
   * @param component Any component extended from Abstract Dialog.
   * @param options Any properties you want them to be in instance of component.
   * @param displayOptions Display options.
   */
  public openDialog<T>(
    component: Type<T>,
    options?: T extends AbstractDialog<infer Options, infer _> ? Options : never,
    displayOptions?: DialogDisplayOptions,
  ): Promise<T extends AbstractDialog<infer _, infer Result> ? Result : void> {
    // Create element
    const dialogContainerFactory = this.componentFactoryResolver.resolveComponentFactory(DialogContainerComponent);

    // Create the component and wire it up with the element
    const dialogFactory = this.componentFactoryResolver.resolveComponentFactory(
      component,
    );
    const dialogComponentRef = dialogFactory.create(this.injector);

    if (!(dialogComponentRef.instance instanceof AbstractDialog)) {
      throw new Error('Dialog is not extended from AbstractDialog');
    }

    if (options != null) {
      // Apply options.
      dialogComponentRef.instance.options = options;

      // Call the hook after props init.
      if (dialogComponentRef.instance.afterPropsInit) {
        dialogComponentRef.instance.afterPropsInit();
      }
    }

    const dialogContainerRef = dialogContainerFactory.create(this.injector, [[dialogComponentRef.location.nativeElement]]);
    // Attach to the view so that the change detector knows to run
    this.applicationRef.attachView(dialogContainerRef.hostView);
    this.applicationRef.attachView(dialogComponentRef.hostView);
    dialogComponentRef.changeDetectorRef.detectChanges();
    dialogComponentRef.changeDetectorRef.detectChanges();

    // Listen to the close event
    dialogComponentRef.instance.closed.pipe(first()).subscribe(() => {
      this.document.body.removeChild(dialogContainerRef.location.nativeElement);
      this.applicationRef.detachView(dialogContainerRef.hostView);
      this.applicationRef.detachView(dialogComponentRef.hostView);
    });

    // Apply display options.
    if (displayOptions != null) {
      if (displayOptions.zIndex != null) {
        (dialogContainerRef.location.nativeElement as HTMLElement).style.zIndex = displayOptions.zIndex.toString();
      }
    }

    // Add to the DOM
    this.document.body.appendChild(dialogContainerRef.location.nativeElement);
    dialogComponentRef.instance.open();

    return dialogComponentRef.instance.closed.pipe(first()).toPromise();
  }
}

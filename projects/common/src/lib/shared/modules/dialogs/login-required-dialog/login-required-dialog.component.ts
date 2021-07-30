import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';

import { AbstractDialog } from '../abstract-dialog';

const MESSAGE = 'You must be registered to Jus-Law to post on the forums.';
const TITLE = 'Login Required';

/**
 * Login required dialog options.
 */
export interface LoginRequiredDialogOptions {
  /** Message. */
  message: string;
}

/**
 * Dialog to require login.
 */
@Component({
  selector: 'jlc-login-required-dialog',
  templateUrl: './login-required-dialog.component.html',
  styleUrls: ['./login-required-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginRequiredDialogComponent extends AbstractDialog<LoginRequiredDialogOptions, void> {
  /**
   * Default message.
   */
  public message = MESSAGE;

  /**
   * Default title.
   */
  public title = TITLE;

  /**
   * @constructor
   * @param router
   */
  public constructor(private router: Router) {
    super();
  }

  /** Navigate to login page. */
  public navigateLogin(): void {
    this.close();
    this.router.navigateByUrl('/auth/login');
  }

  /** Navigate to registration page. */
  public navigateRegister(): void {
    this.close();
    this.router.navigateByUrl('/auth/register');
  }

  /** Close dialog. */
  public onCloseClicked(): void {
    this.close();
  }
}

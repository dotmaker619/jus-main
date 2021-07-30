import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CanLeavePageMobileGuard implements CanDeactivate<unknown> {
  /** @inheritdoc */
  public canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
    return true;
  }
}

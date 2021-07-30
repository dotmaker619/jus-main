import { Injectable } from '@angular/core';
import { CanActivate, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { RegistrationStepMergerService } from '../services/registration-step-merger.service';

/** Guard to check if user can procede to the next step of registration. */
@Injectable({ providedIn: 'root' })
export class CanContinueRegistrationGuard implements CanActivate {
  private readonly redirectUrlTree: UrlTree;

  /**
   * @constructor
   * @param registrationMerger Registration merger service.
   * @param router Router.
   */
  public constructor(
    private readonly registrationMerger: RegistrationStepMergerService,
    private readonly router: Router,
  ) {
    this.redirectUrlTree = this.router.createUrlTree(['/auth/register']);
  }

  /** @inheritdoc */
  public canActivate(): Observable<boolean | UrlTree> {
    return this.registrationMerger.getRegistrationData().pipe(
      map(data =>
        data != null ? true : this.redirectUrlTree,
      ),
    );
  }
}

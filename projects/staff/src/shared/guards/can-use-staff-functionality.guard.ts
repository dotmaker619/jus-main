import { Injectable } from '@angular/core';
import { UrlTree, Router, CanActivate } from '@angular/router';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { Observable } from 'rxjs';
import { filter, pluck, first, map } from 'rxjs/operators';

/** Guard checks whether the staff functionality is paid, if not - it redirects to a payment page. */
@Injectable({
  providedIn: 'root',
})
export class CanUseStaffFunctionalityGuard implements CanActivate {

  /** Shows whether the user paid staff fee. */
  public readonly isStaffPaid$: Observable<boolean>;

  public constructor(
    currentUserService: CurrentUserService,
    private readonly router: Router,
  ) {
    this.isStaffPaid$ = currentUserService.getCurrentStaff().pipe(
      filter(user => user != null),
      pluck('isPaid'),
    );
  }

  /** @inheritdoc */
  public canActivate(): Observable<boolean | UrlTree> {
    const paymentUrl = this.router.createUrlTree(['/payment']);
    return this.isStaffPaid$.pipe(
      first(),
      map(isPaid => isPaid || paymentUrl),
    );
  }

}

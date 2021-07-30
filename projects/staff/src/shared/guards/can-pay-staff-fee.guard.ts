import { Injectable } from '@angular/core';
import { CanActivate, CanLoad, UrlTree, Router } from '@angular/router';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { Observable } from 'rxjs';
import { first, map, tap } from 'rxjs/operators';

/** Guards routes from user with paid staff fee. */
@Injectable({ providedIn: 'root' })
export class CanPayStaffFeeGuard implements CanActivate, CanLoad {

  /** Route to navigate in case current navigation is forbidden. */
  private readonly redirectUrl: UrlTree;

  /**
   * @constructor
   * @param currentUserService User service.
   * @param router Router.
   */
  public constructor(
    private readonly currentUserService: CurrentUserService,
    private readonly router: Router,
  ) {
    this.redirectUrl = this.router.createUrlTree(['/']);
  }

  /** Checks whether the user can load route. */
  public canActivate(): Observable<boolean | UrlTree> {
    return this.checkCanProcedeToRoute().pipe(
      map(canProcede => canProcede || this.redirectUrl),
    );
  }

  /** Checks whether the user can procede to a selected route and navigates to default route in case selected is forbidden. */
  public canLoad(): Observable<boolean> {
    return this.checkCanProcedeToRoute().pipe(
      tap(canProcede => canProcede || this.router.navigateByUrl(this.redirectUrl)),
    );
  }

  private checkCanProcedeToRoute(): Observable<boolean> {
    const staff$ = this.currentUserService.getCurrentStaff().pipe(
      first(),
    );

    return staff$.pipe(
      // Allow only staff users with not paid fee.
      map(({ isPaid }) => !isPaid),
    );
  }
}

import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@jl/common/core/services/auth.service';
import { first } from 'rxjs/operators';

/**
 * Component for user logout.
 * This component will call auth service to logout user on initialization.
 */
@Component({
  selector: 'jlc-logout',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogoutComponent implements OnInit {

  /**
   * @constructor
   * @param authService
   * @param router
   */
  public constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) { }

  /** @inheritDoc */
  public ngOnInit(): void {
    this.authService.logout().pipe(
      first(),
    ).subscribe(() => this.router.navigate(['auth/login']));
  }
}

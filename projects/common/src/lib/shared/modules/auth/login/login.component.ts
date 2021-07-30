import { Component, OnInit, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DestroyableBase } from '@jl/common/core';
import { Login } from '@jl/common/core/models/login';
import { Role } from '@jl/common/core/models/role';
import { AuthService } from '@jl/common/core/services/auth.service';
import { BehaviorSubject } from 'rxjs';
import { take, map, takeUntil, switchMap, withLatestFrom } from 'rxjs/operators';

const DEFAULT_REDIRECT_URL = '';

/**
 * Component to perform attorney login.
 */
@Component({
  selector: 'jlc-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent extends DestroyableBase implements OnInit {
  private redirectUrl: string;

  /**
   * Define if authentication was failed.
   */
  public readonly isFailed$ = new BehaviorSubject<boolean>(false);

  /**
   * Is submitting in progress.
   */
  public readonly isSubmitting$ = new BehaviorSubject<boolean>(false);

  /**
   * Can deactivate component.
   */
  public canDeactivate = true;

  /**
   * Login form.
   */
  public form = this.formBuilder.group({
    email: ['', Validators.required],
    password: ['', Validators.required],
  });

  /**
   * Listen `beforeunload` event.
   */
  @HostListener('window:beforeunload', ['$event'])
  public unloadNotification($event: BeforeUnloadEvent): void {
    if (!this.canDeactivate) {
      $event.preventDefault();
      $event.returnValue = true;
    }
  }

  /**
   * @constructor
   *
   * @param formBuilder Form builder instance.
   * @param authService Service for user authentication.
   * @param activatedRoute Current user route.
   * @param router Angular router.
   */
  public constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
  ) {
    super();
  }

  /**
   * Gather redirect url from query params.
   */
  public ngOnInit(): void {
    const params = this.activatedRoute.snapshot.queryParams;
    this.redirectUrl = params['next'];

    this.onChanges();
  }

  private onChanges(): void {
    this.form.valueChanges
      .pipe(
        // Checking that at least one field has value.
        map(formValue => Object.keys(formValue).some(key => !!formValue[key])),
        takeUntil(this.destroy$),
      )
      .subscribe(hasValue => this.canDeactivate = !hasValue);
  }

  /**
   * Perform authentication.
   */
  public onFormSubmitted(): void {
    this.isSubmitting$.next(true);
    const credentials = new Login(this.form.value);
    this.authService.login(credentials).pipe(
      switchMap(() => this.authService.userType$),
    ).subscribe((role) => {
      this.canDeactivate = true;
      this.handleFinishLogin(role, true);
    },
      () => this.handleFailedLogin(),
    );
  }

  private handleFinishLogin(role: Role, shouldGreetUser: boolean): void {
    if (this.redirectUrl != null) {
      this.router.navigate([this.redirectUrl]);
    } else {
      this.router.navigate([DEFAULT_REDIRECT_URL]);
    }
  }

  /**
   * Actions to be performed on from submit fail.
   */
  private handleFailedLogin(): void {
    this.isFailed$.next(true);
    this.isSubmitting$.next(false);
  }
}

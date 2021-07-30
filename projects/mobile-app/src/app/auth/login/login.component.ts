import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Login } from '@jl/common/core/models/login';
import { Role } from '@jl/common/core/models/role';
import { AppConfigService } from '@jl/common/core/services/app-config.service';
import { AuthService } from '@jl/common/core/services/auth.service';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';

/** Component to perform attorney login */
@Component({
  selector: 'jlat-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit {
  private readonly defaultRedirectUrl = '';
  private redirectUrl: string;

  /** Define if authentication was failed */
  public readonly isFailed$ = new BehaviorSubject<boolean>(false);

  /**
   * Is submitting in progress.
   */
  public readonly isSubmitting$ = new BehaviorSubject<boolean>(false);

  /** Login form */
  public form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  /** Set isFailed value to false */
  private handleFailedLogin(): void {
    this.isFailed$.next(true);
    this.isSubmitting$.next(false);
  }

  /**
   * @constructor
   * @param fb
   * @param authService
   * @param activatedRoute
   * @param router
   * @param appConfig
   */
  public constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private appConfig: AppConfigService,
  ) { }

  /**
   * Provide url for client application.
   */
  public get clientVersionAppUrl(): string {
    return this.appConfig.webVersionUrl;
  }

  /** Perform authentication */
  public onFormSubmitted(): void {
    this.isSubmitting$.next(true);
    const credentials = new Login(this.form.value);
    this.authService.login(credentials)
      .pipe(
        take(1),
      )
      .subscribe(
        (authData) => {
          if (authData.role !== Role.Attorney) {
            this.isFailed$.next(true);
            this.isSubmitting$.next(false);
            this.authService.logout();
          } else {
            this.router.navigate([this.redirectUrl]);
          }
        },
        () => this.handleFailedLogin(),
      );
  }

  /** Gather redirect url from query params */
  public ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      this.redirectUrl = params['next'] || this.defaultRedirectUrl;
    });
  }
}

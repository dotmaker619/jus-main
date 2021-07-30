import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Client } from '@jl/common/core/models';
import { TEntityValidationErrors } from '@jl/common/core/models/api-error';
import { Attorney } from '@jl/common/core/models/attorney';
import { catchValidationError } from '@jl/common/core/rxjs/catch-validation-error';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { AlertService } from '@jl/common/mobile/services/alert.service';
import { Observable, EMPTY, BehaviorSubject, of, merge, NEVER } from 'rxjs';
import { first, tap, switchMapTo, shareReplay, map, switchMap } from 'rxjs/operators';

/** Profile edit page for mobile workspace. */
@Component({
  selector: 'jlat-mobile-profile-edit-page',
  templateUrl: './mobile-profile-edit-page.component.html',
  styleUrls: ['./mobile-profile-edit-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileProfileEditPageComponent {
  /** Is loading. */
  public readonly isLoading$ = new BehaviorSubject<boolean>(false);
  /** Attorney. */
  public readonly attorney$: Observable<Attorney>;
  /** API validation errors. */
  public readonly validationError$ = new BehaviorSubject<TEntityValidationErrors<Client>>(null);
  /** Form. */
  public readonly form$: Observable<FormGroup>;
  /**
   * @constructor
   * @param userService User service.
   * @param alertService Alert service.
   * @param formBuilder Form builder.
   */
  public constructor(
    private readonly userService: CurrentUserService,
    private readonly alertService: AlertService,
    private readonly formBuilder: FormBuilder,
  ) {
    this.attorney$ = this.userService.getCurrentAttorney().pipe(
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
    this.form$ = this.initFormStream();
  }

  private initFormStream(): Observable<FormGroup> {
    const form = this.formBuilder.group({
      attorney: [],
    });
    const fillForm$ = this.attorney$.pipe(
      first(),
      tap(attorney => form.patchValue({
        attorney,
      })),
      switchMapTo(NEVER),
    );
    return merge(of(form), fillForm$);
  }

  /**
   * Handle form submit.
   * @param form Form.
   */
  public onSubmit(form: FormGroup): void {
    this.isLoading$.next(true);
    const attorney$ = this.attorney$.pipe(
      first(),
      map(curAttorney => new Attorney({
        ...curAttorney,
        ...form.value.attorney,
      })),
    );
    attorney$.pipe(
      switchMap(attorney => this.userService.updateCurrentAttorney(attorney)),
      first(),
      onMessageOrFailed(() => this.isLoading$.next(false)),
      catchValidationError(apiError => {
        const { validationData } = apiError;
        this.validationError$.next(validationData);
        return EMPTY;
      }),
    )
      .subscribe(() => this.alertService.showNotificationAlert({
        header: 'Successful',
        message: 'Profile has been updated',
      }));
  }
}

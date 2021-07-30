import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { JusLawValidators } from '@jl/common/core/validators/validators';
import { AlertService } from '@jl/common/mobile/services/alert.service';
import { Observable, of, EMPTY, merge, ReplaySubject, BehaviorSubject } from 'rxjs';
import { switchMap, first, take, switchMapTo, tap } from 'rxjs/operators';

/** Additional information page. */
@Component({
  selector: 'jlst-additional-info',
  templateUrl: './additional-info.component.html',
  styleUrls: ['./additional-info.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdditionalInfoComponent {

  /** Is app loading. */
  public readonly isLoading$ = new BehaviorSubject<boolean>(false);

  /** Form. */
  public readonly form$: Observable<FormGroup>;

  /** Validation errors. */
  public readonly validationError$ = new ReplaySubject<void>(1);

  public constructor(
    private readonly formBuilder: FormBuilder,
    private readonly currentUserService: CurrentUserService,
    private readonly alertService: AlertService,
  ) {
    this.form$ = this.initFormStream();
  }

  /**
   * Handle click on save button.
   * @param form Form.
   */
  public onSaveClicked(form: FormGroup): void {
    form.markAllAsTouched();
    if (form.invalid || this.isLoading$.value) {
      return;
    }

    const val = form.value;
    this.isLoading$.next(true);
    this.currentUserService.updateStaffUser(val).pipe(
      take(1),
      onMessageOrFailed(() => this.isLoading$.next(false)),
      switchMap(() => this.notifyAboutSuccessfulChange()),
    ).subscribe();
  }

  private notifyAboutSuccessfulChange(): Promise<void> {
    return this.alertService.showNotificationAlert({
      header: 'Profile updated!',
    });
  }

  /**
   * On profile image changed.
   *
   * @param form Form control.
   * @param file File with an image.
   */
  public onProfileImageChanged(form: FormGroup, file: File): void {
    const avatarFormControl = form.get('avatar') as FormControl;
    avatarFormControl.setValue(file);
    avatarFormControl.markAsDirty();
  }

  private initFormStream(): Observable<FormGroup> {
    const form = this.formBuilder.group({
      avatar: [null],
      firstName: [{value: null, disabled: true}, [Validators.required]],
      lastName: [{value: null, disabled: true}, [Validators.required]],
      description: [null, [Validators.required]],
    });

    const fillForm$ = this.currentUserService.getCurrentStaff().pipe(
      first(),
      tap(user => form.patchValue({
        avatar: user.avatar,
        firstName: user.firstName,
        lastName: user.lastName,
        description: user.description,
      })),
      switchMapTo(EMPTY),
    );

    return merge(of(form), fillForm$);
  }
}

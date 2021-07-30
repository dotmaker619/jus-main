import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { DialogsService } from '@jl/common/shared/modules/dialogs/dialogs.service';
import { Observable, ReplaySubject, BehaviorSubject } from 'rxjs';
import { take, switchMap, map } from 'rxjs/operators';

/**
 * Staff information component.
 */
@Component({
  selector: 'jlst-staff-info',
  templateUrl: './staff-info.component.html',
  styleUrls: ['./staff-info.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StaffInfoComponent {
  /** Staff information form. */
  public readonly form$: Observable<FormGroup>;
  /** Validation errors. */
  public readonly validationError$ = new ReplaySubject<void>(1);
  /** Loading controller. */
  public readonly isLoading$ = new BehaviorSubject(false);

  /**
   * @constructor
   *
   * @param fb Form builder.
   * @param currentUserService Current user service.
   * @param dialogsService Dialogs service.
   */
  public constructor(
    fb: FormBuilder,
    private readonly currentUserService: CurrentUserService,
    private readonly dialogsService: DialogsService,
  ) {
    this.form$ = this.initFormStream(fb);
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

  /**
   * Handle click on save button.
   * @param form Form.
   */
  public onSubmit(form: FormGroup): void {
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

  private initFormStream(fb: FormBuilder): Observable<FormGroup> {
    return this.currentUserService.getCurrentStaff().pipe(
      map((staff) => fb.group({
        avatar: [staff.avatar],
        firstName: [{ value: staff.firstName, disabled: true }, [Validators.required]],
        lastName: [{ value: staff.lastName, disabled: true }, [Validators.required]],
        description: [staff.description, [Validators.required]],
      })),
    );
  }

  private notifyAboutSuccessfulChange(): Promise<void> {
    return this.dialogsService.showSuccessDialog({
      message: 'Your profile has been successfully updated',
      title: 'Profile updated!',
    });
  }
}

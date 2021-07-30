import { Location } from '@angular/common';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { DestroyableBase } from '@jl/common/core';
import { TEntityValidationErrors } from '@jl/common/core/models/api-error';
import { Attorney } from '@jl/common/core/models/attorney';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { DialogsService } from '@jl/common/shared';
import { BehaviorSubject, Observable, EMPTY } from 'rxjs';
import { switchMap, catchError, finalize, takeUntil } from 'rxjs/operators';

const SUCCESS_DIALOG_INFO = {
  title: 'Account information updated successfully',
  message: '',
};

/**
 * Attorney profile page.
 */
@Component({
  selector: 'jlat-profile-edit-page',
  templateUrl: './profile-edit-page.component.html',
  styleUrls: ['./profile-edit-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileEditPageComponent extends DestroyableBase {

  /**
   * Contain loader state.
   */
  public readonly loading$ = new BehaviorSubject<boolean>(false);

  /**
   * Attorney data.
   */
  public readonly attorney$: Observable<Attorney>;

  /**
   * Validation error.
   */
  public validationError$ = new BehaviorSubject<TEntityValidationErrors<Attorney>>(null);

  /**
   * @constructor
   *
   * @param location Location service.
   * @param userService User service.
   * @param dialogsService Dialog service.
   */
  public constructor(
    private readonly location: Location,
    private readonly userService: CurrentUserService,
    private readonly dialogsService: DialogsService,
  ) {
    super();
    this.attorney$ = this.userService.getCurrentAttorney();
  }

  /**
   * Save profile changes.
   */
  public onFormSubmit(attorney: Attorney): void {
    this.loading$.next(true);
    this.userService.updateCurrentAttorney(attorney)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          this.validationError$.next(error.validationData);
          this.dialogsService.showInformationDialog({
            title: error.message,
            message: '',
          });
          return EMPTY;
        }),
        switchMap(() => {
          this.dialogsService.showInformationDialog(SUCCESS_DIALOG_INFO);
          return EMPTY;
        }),
        finalize(() => this.loading$.next(false)),
      )
      .subscribe();
  }

  /**
   * Handle cancel clicked event.
   */
  public onCancelClicked(): void {
    this.location.back();
  }

}

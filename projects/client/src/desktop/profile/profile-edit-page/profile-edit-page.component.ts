import { Location } from '@angular/common';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TEntityValidationErrors } from '@jl/common/core/models/api-error';
import { Client } from '@jl/common/core/models/client';
import { catchValidationError } from '@jl/common/core/rxjs';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { DialogsService } from '@jl/common/shared';
import { BehaviorSubject, EMPTY, Observable } from 'rxjs';
import { tap, switchMap, first } from 'rxjs/operators';

/**
 * Client profile page.
 */
@Component({
  selector: 'jlcl-profile-edit-page',
  templateUrl: './profile-edit-page.component.html',
  styleUrls: ['./profile-edit-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileEditPageComponent {

  /**
   * Is submitting in progress.
   */
  public readonly isSubmitting$ = new BehaviorSubject<boolean>(false);

  /**
   * API validation errors.
   */
  public readonly validationError$ = new BehaviorSubject<TEntityValidationErrors<Client>>(null);

  /**
   * Current client.
   */
  public readonly additionalInfo$: Observable<Client>;

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
    this.additionalInfo$ = this.userService.getCurrentClient();
  }

  /**
   * On "Additional Information" form submitted.
   *
   * @param additionalInfo Registration data.
   */
  public onAdditionalInfoSubmitted(additionalInfo: Client): void {
    this.isSubmitting$.next(true);
    this.userService.updateClientUser(additionalInfo)
      .pipe(
        first(),
        tap(() => this.isSubmitting$.next(false)),
        catchValidationError(apiError => {
          this.dialogsService.showInformationDialog({ title: 'Registration error', message: apiError.message });
          const { validationData } = apiError;
          this.validationError$.next(validationData);
          this.isSubmitting$.next(false);
          return EMPTY;
        }),
        switchMap(() => this.dialogsService.showInformationDialog({
          title: 'Additional information updated successfully',
          message: '',
        })),
      )
      .subscribe();
  }

  /**
   * Leave my profile page.
   */
  public onCurrentStepCancelled(): void {
    this.location.back();
  }

}

import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { TEntityValidationErrors, ApiValidationError, ApiError } from '@jl/common/core/models/api-error';
import { ClientType } from '@jl/common/core/models/client';
import { Invite } from '@jl/common/core/models/invite';
import { catchValidationError } from '@jl/common/core/rxjs';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { InvitesService } from '@jl/common/core/services/attorney/invites.service';
import { AlertService } from '@jl/common/mobile/services/alert.service';
import { ENTER_FORM_FIELD_ANIMATION } from '@jl/common/shared/animations/enter-form-field.animation';
import { Observable, BehaviorSubject, of, EMPTY, NEVER, merge } from 'rxjs';
import { catchError, startWith, tap, switchMapTo } from 'rxjs/operators';

/**
 * Invitation client modal.
 */
@Component({
  selector: 'jlat-invite-client-modal',
  templateUrl: './invite-client-modal.component.html',
  styleUrls: ['./invite-client-modal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    ENTER_FORM_FIELD_ANIMATION,
  ],
})
export class InviteClientModalComponent {
  /**
   * Invite form.
   */
  public readonly form$: Observable<FormGroup>;
  /**
   * Validation error.
   */
  public readonly validationError$ = new BehaviorSubject<TEntityValidationErrors<Invite>>(null);
  /**
   * Loading controller.
   */
  public readonly isLoading$ = new BehaviorSubject<boolean>(false);
  /**
   * Is client an organization.
   */
  public readonly isOrganization = new BehaviorSubject<boolean>(false);
  /**
   * Client types enum.
   */
  public readonly clientTypeOptions = ClientType;

  /**
   * @constructor.
   *
   * @param invitesService Invites service.
   * @param fb Form builder.
   * @param modalCtrl Modal controller.
   * @param router Router.
   * @param alertService Alert service.
   */
  public constructor(
    private readonly invitesService: InvitesService,
    private readonly fb: FormBuilder,
    private readonly modalCtrl: ModalController,
    private readonly router: Router,
    private readonly alertService: AlertService,
  ) {
    this.form$ = this.createFormStream();
  }

  /**
   * Handles 'submit' event of invite form.
   *
   * @param form Form group.
   */
  public onFormSubmitted(form: FormGroup): void {
    form.markAllAsTouched();
    if (form.invalid || this.isLoading$.value) {
      return;
    }
    const invite = new Invite(form.value);
    this.isLoading$.next(true);
    this.invitesService.createInvite(invite).pipe(
      onMessageOrFailed(() => this.isLoading$.next(false)),
      catchValidationError((error: ApiValidationError<Invite>) => {
        this.validationError$.next(error.validationData);
        return EMPTY;
      }),
      catchError((error: ApiError) => {
        this.showErrorAlert(error.message);
        return EMPTY;
      }),
    ).subscribe((createdInvite) => this.showSuccessfulInvitationMessage(createdInvite.email));
  }

  /**
   * Handles click on the 'Cancel' button.
   */
  public onCancelClick(): void {
    this.close();
  }

  private createFormStream(): Observable<FormGroup> {
    const form = this.fb.group({
      firstName: [null, Validators.required],
      lastName: [null, Validators.required],
      email: [null, [Validators.required, Validators.email]],
      message: [null, Validators.required],
      clientType: [ClientType.Individual, [Validators.required]],
    });

    const formMutation$ = form.controls.clientType.valueChanges.pipe(
      startWith(null),
      tap(() => this.mutateForm(form)),
      switchMapTo(NEVER),
    );

    return merge(of(form), formMutation$);
  }

  private async showErrorAlert(message: string): Promise<void> {
    this.alertService.showNotificationAlert({
      header: 'An error occured', message,
    });
  }

  private async showSuccessfulInvitationMessage(email: string): Promise<void> {
    const header = 'Invitation Sent';
    const message = `An invite has been successfully sent to ${email}`;

    await this.alertService.showNotificationAlert({
      header, message,
    });
    this.close();
  }

  private mutateForm(form: FormGroup): void {
    switch (form.controls.clientType.value) {
      case ClientType.Individual:
        if (form.contains('organizationName')) {
          form.removeControl('organizationName');
        }
        break;
      case ClientType.Organization:
        if (!form.contains('organizationName')) {
          form.addControl(
            'organizationName',
            new FormControl(null, Validators.required),
          );
        }
        break;
    }
  }

  private close(): void {
    this.modalCtrl.dismiss();
  }
}

import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ApiValidationError, TEntityValidationErrors, ApiError } from '@jl/common/core/models/api-error';
import { ClientType } from '@jl/common/core/models/client';
import { Invite } from '@jl/common/core/models/invite';
import { catchValidationError } from '@jl/common/core/rxjs';
import { InvitesService } from '@jl/common/core/services/attorney/invites.service';
import { triggerValidation } from '@jl/common/core/utils/form-trigger';
import { AbstractDialog, DialogsService } from '@jl/common/shared';
import { ENTER_FORM_FIELD_ANIMATION } from '@jl/common/shared/animations/enter-form-field.animation';
import { EMPTY, BehaviorSubject, Observable } from 'rxjs';
import { catchError, finalize, tap, mapTo, startWith } from 'rxjs/operators';

/** Create invite dialog. */
@Component({
  selector: 'jlat-invite-form-dialog',
  templateUrl: './invite-form-dialog.component.html',
  styleUrls: ['./invite-form-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    ENTER_FORM_FIELD_ANIMATION,
  ],
})
export class NewInviteDialogComponent extends AbstractDialog<never, Invite | null> {

  /** Invite form. */
  public form$: Observable<FormGroup>;

  /** Validation error. */
  public validationError$ = new BehaviorSubject<TEntityValidationErrors<Invite>>(null);

  /** Loading state subject. */
  public isLoading$ = new BehaviorSubject<boolean>(false);

  /**
   * Client types enum.
   */
  public readonly clientTypeOptions = ClientType;

  /**
   * @constructor
   * @param invitesService
   * @param fb
   * @param dialogsService
   * @param changeDetectionRef
   */
  public constructor(
    private invitesService: InvitesService,
    private fb: FormBuilder,
    private dialogsService: DialogsService,
    private changeDetectionRef: ChangeDetectorRef,
  ) {
    super();
    this.form$ = this.createFormStream();
  }

  private createFormStream(): Observable<FormGroup> {
    const form = this.createForm();

    return form.controls.clientType.valueChanges.pipe(
      startWith(null),
      tap(() => this.mutateForm(form)),
      mapTo(form),
    );
  }

  private createForm(): FormGroup {
    return this.fb.group({
      firstName: [null, Validators.required],
      lastName: [null, Validators.required],
      email: [null, [Validators.required, Validators.email]],
      message: [null, Validators.required],
      clientType: [ClientType.Individual, [Validators.required]],
    });
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

  /** Create new invite. */
  public onSubmitted(form: FormGroup): void {
    triggerValidation(form);
    if (!form.valid) {
      return;
    }
    this.isLoading$.next(true);
    const invite = new Invite(form.value);
    this.invitesService.createInvite(invite).pipe(
      catchValidationError((error: ApiValidationError<Invite>) => {
        this.validationError$.next(error.validationData);
        this.changeDetectionRef.detectChanges();
        return EMPTY;
      }),
      catchError((error: ApiError) => {
        let message = 'Invite not created.';
        if (error.message) {
          message = error.message;
        }
        this.dialogsService.showInformationDialog({
          title: 'An error occurred',
          message,
        });
        return EMPTY;
      }),
      finalize(() => this.isLoading$.next(false)),
    ).subscribe((createdInvite) => {
      this.close(createdInvite);
    });
  }

  /** Close dialog. */
  public onCloseClicked(): void {
    this.close(null);
  }
}

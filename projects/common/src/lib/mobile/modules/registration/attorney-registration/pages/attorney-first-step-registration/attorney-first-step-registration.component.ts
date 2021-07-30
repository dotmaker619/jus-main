import { Component, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TEntityValidationErrors } from '@jl/common/core/models/api-error';
import { AttorneyRegistration } from '@jl/common/core/models/attorney-registration';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { InvitesService } from '@jl/common/core/services/attorney/invites.service';
import { RegistrationService } from '@jl/common/core/services/registration.service';
import { Observable, of, ReplaySubject, BehaviorSubject, merge, NEVER } from 'rxjs';
import { first, tap, filter, map, switchMap, switchMapTo } from 'rxjs/operators';

import { RegistrationStepMergerService } from '../../../services/registration-step-merger.service';
import { CreateAccountFormComponent } from '../../components/create-account-form/create-account-form.component';

/** First step in a registration of an Attorney. For mobile devices. */
@Component({
  selector: 'jlc-attorney-first-step-registration',
  templateUrl: './attorney-first-step-registration.component.html',
  styleUrls: ['./attorney-first-step-registration.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttorneyFirstStepRegistrationComponent {

  /** Account form group component. */
  @ViewChild(CreateAccountFormComponent, { static: false })
  public createAccountForm: CreateAccountFormComponent;
  /** Is loading. */
  public readonly isLoading$ = new BehaviorSubject<boolean>(false);
  /** Form. */
  public readonly form$: Observable<FormGroup>;
  /** Validation error. */
  public readonly validationError$: Observable<TEntityValidationErrors<AttorneyRegistration>>;

  private readonly firstStepValidationError$ = new ReplaySubject<TEntityValidationErrors<AttorneyRegistration>>(1);

  /**
   * @constructor
   * @param formBuilder Form builder.
   * @param registrationMerger Registration merger service.
   * @param router Router.
   * @param activatedRoute Activated route.
   */
  public constructor(
    route: ActivatedRoute,
    private readonly formBuilder: FormBuilder,
    private readonly registrationMerger: RegistrationStepMergerService<AttorneyRegistration>,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly registrationService: RegistrationService,
    private readonly invitesService: InvitesService,
  ) {
    this.validationError$ = merge(
      this.registrationMerger.getValidationError(),
      this.firstStepValidationError$,
    );

    const inviteUUID$ = route.queryParamMap.pipe(
      map((params) => params.get('invite')),
    );
    this.form$ = this.initFormStream(inviteUUID$);
  }

  /** Init form stream. */
  public initFormStream(inviteUUID$: Observable<string>): Observable<FormGroup> {
    const form = this.formBuilder.group({
      attorney: [],
    });

    const fillInvitedUserEmail$ = inviteUUID$.pipe(
      filter(invite => !!invite),
      switchMap((invite) => this.getInvitedUserEmail(invite)),
      tap((email) => form.get('attorney').patchValue({ email })),
      switchMapTo(NEVER),
    );

    return merge(of(form), fillInvitedUserEmail$);
  }

  private getInvitedUserEmail(invite: string): Observable<string> {
    return this.invitesService.getInvitedClient(invite).pipe(
      map((userData) => userData.email),
    );
  }

  /**
   * Handle form submission.
   * @param form Form.
   */
  public onSubmit(form: FormGroup): void {
    this.createAccountForm.markAsTouched();
    if (form.invalid) {
      return;
    }
    this.isLoading$.next(true);
    const attorneyData = form.value.attorney;
    this.registrationService
      .validateAttorneyRegistrationStep(attorneyData, 'first')
      .pipe(
        first(),
        onMessageOrFailed(() => this.isLoading$.next(false)),
        tap((err) => this.firstStepValidationError$.next(err && err.validationData)),
        filter(error => error == null),
      )
      .subscribe(
        () => {
          this.registrationMerger.setRegistrationData(
            attorneyData,
          );
          this.router.navigate(['additional'], {
            relativeTo: this.activatedRoute,
          });
        },
      );
  }
}

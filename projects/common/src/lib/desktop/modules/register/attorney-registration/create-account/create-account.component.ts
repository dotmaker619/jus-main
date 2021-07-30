import { Component, ChangeDetectionStrategy, EventEmitter, Output, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DestroyableBase } from '@jl/common/core';
import { TEntityValidationErrors } from '@jl/common/core/models/api-error';
import { AttorneyRegistration } from '@jl/common/core/models/attorney-registration';
import { InvitesService } from '@jl/common/core/services/attorney/invites.service';
import { triggerValidation } from '@jl/common/core/utils/form-trigger';
import { JusLawValidators } from '@jl/common/core/validators/validators';
import { DialogsService } from '@jl/common/shared';
import { BehaviorSubject, Observable, of, NEVER, merge, EMPTY } from 'rxjs';
import { map, filter, switchMap, shareReplay, takeUntil, withLatestFrom, switchMapTo, tap, mapTo } from 'rxjs/operators';

/**
 * Component for 1 step attorneys registration.
 */
@Component({
  selector: 'jlc-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateAccountComponent extends DestroyableBase implements OnChanges {

  /**
   * Form for attorney creation.
   */
  public readonly attorneyForm$: Observable<FormGroup>;

  /**
   * Registration validation error.
   */
  @Input()
  public validationError: TEntityValidationErrors<AttorneyRegistration> = {};

  /**
   * Registration data.
   */
  @Input()
  public registrationData: AttorneyRegistration;

  /**
   * Registration data emitter.
   */
  @Output()
  public formSubmit = new EventEmitter<AttorneyRegistration>();

  /**
   * Cancel current step event.
   */
  @Output()
  public cancel = new EventEmitter<void>();

  /**
   * Emit status of form.
   */
  @Output()
  public isFormNotEmpty = new EventEmitter<boolean>();

  /**
   * Wrap registration data to Observable to easy integrate with other parts of the page.
   */
  private registrationData$ = new BehaviorSubject<AttorneyRegistration>(this.registrationData);

  /**
   * @constructor
   *
   * @param route Activated route.
   * @param fb Form builder.
   * @param dialogService Dialog service.
   * @param invitesService Invites service.
   */
  public constructor(
    route: ActivatedRoute,
    private fb: FormBuilder,
    private dialogService: DialogsService,
    private readonly invitesService: InvitesService,
  ) {
    super();

    const invite$ = route.queryParamMap.pipe(
      map((params) => params.get('invite')),
    );

    this.attorneyForm$ = this.createFormStream(invite$);

    this.onChanges();
  }

  private onChanges(): void {
    this.attorneyForm$
      .pipe(
        switchMap(form => form.valueChanges),
        // Checking that at least one field has value.
        map(formValue => Object.keys(formValue).some(key => !!formValue[key])),
        takeUntil(this.destroy$),
      )
      .subscribe(hasValue => this.isFormNotEmpty.emit(hasValue));
  }

  private createForm(registrationData: AttorneyRegistration): FormGroup {
    return this.fb.group({
      email: [registrationData.email, [Validators.required, Validators.email]],
      password: [registrationData.password, [Validators.required, Validators.minLength(8)]],
      passwordConfirmation: [
        registrationData.passwordRepeat,
        [JusLawValidators.matchControl('password', 'Password')],
      ],
    });
  }

  private createFormStream(invite$: Observable<string>): Observable<FormGroup> {
    return this.registrationData$
      .pipe(
        filter(data => data != null),
        map(registrationData => this.createForm(registrationData)),
        withLatestFrom(invite$),
        switchMap(([form, invite]) => this.addFormSideEffects(form, invite)),
        shareReplay({ refCount: true, bufferSize: 1 }),
      );
  }

  private addFormSideEffects(form: FormGroup, invite: string): Observable<FormGroup> {
    const fillEmail$ = !invite
      ? EMPTY
      : this.getInvitedUserEmail(invite)
        .pipe(
          tap((email) => form.get('email').patchValue(email)),
          switchMapTo(NEVER),
        );

    return merge(of(form), fillEmail$);
  }

  private getInvitedUserEmail(invite: string): Observable<string> {
    return this.invitesService.getInvitedClient(invite).pipe(
      map((userData) => userData.email),
    );
  }

  /**
   * @inheritdoc
   */
  public ngOnChanges(changes: SimpleChanges): void {
    if (('registrationData' in changes) && this.registrationData != null) {
      // Recreate form because of data changed.
      this.registrationData$.next(this.registrationData);
    }
  }

  /**
   * Run on registration form submit.
   */
  public onFormSubmitted(form: FormGroup): void {
    if (form.valid) {
      const registrationData = new AttorneyRegistration({
        ...this.registrationData,
        email: form.get('email').value,
        password: form.get('password').value,
        passwordRepeat: form.get('passwordConfirmation').value,
      });
      this.formSubmit.emit(registrationData);
    } else {
      triggerValidation(form);
      this.dialogService.showValidationError();
    }
  }

  /**
   * On "Cancel" button clicked.
   */
  public onCancelClicked(): void {
    this.cancel.emit();
  }
}

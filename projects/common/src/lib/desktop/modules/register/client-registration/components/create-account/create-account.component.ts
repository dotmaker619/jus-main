import { Component, ChangeDetectionStrategy, Input, EventEmitter, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { DestroyableBase } from '@jl/common/core';
import { ClientRegistration } from '@jl/common/core/models';
import { TEntityValidationErrors } from '@jl/common/core/models/api-error';
import { ClientType } from '@jl/common/core/models/client';
import { JusLawValidators } from '@jl/common/core/validators/validators';
import { ENTER_FORM_FIELD_ANIMATION } from '@jl/common/shared/animations/enter-form-field.animation';
import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { filter, map, shareReplay, switchMap, takeUntil, startWith, tap, first } from 'rxjs/operators';

const DEFAULT_SELECTED_CLIENT_TYPE = ClientType.Individual;

/**
 * Create account page component.
 */
@Component({
  selector: 'jlc-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    ENTER_FORM_FIELD_ANIMATION,
  ],
})
export class CreateAccountComponent extends DestroyableBase implements OnChanges {
  /**
   * Registration data.
   */
  @Input()
  public registrationData: ClientRegistration;

  /**
   * API validation errors.
   */
  @Input()
  public validationError: TEntityValidationErrors<ClientRegistration>;

  /**
   * Form submit event.
   */
  @Output()
  public readonly formSubmit = new EventEmitter<Partial<ClientRegistration>>();

  /**
   * Cancel event.
   */
  @Output()
  public readonly cancel = new EventEmitter<void>();

  /**
   * Emit status of form.
   */
  @Output()
  public readonly isFormNotEmpty = new EventEmitter<boolean>();

  /**
   * Create account form.
   */
  public readonly form$: Observable<FormGroup>;

  /**
   * Registration data Observable wrapper.
   */
  private readonly registrationData$ = new BehaviorSubject<ClientRegistration>(this.registrationData);

  /**
   * Client types enum.
   */
  public readonly clientTypeOptions = ClientType;

  /**
   * @constructor
   * @param formBuilder Form builder.
   */
  public constructor(
    private formBuilder: FormBuilder,
  ) {
    super();
    this.form$ = this.createAccountFormStream();

    this.onChanges();
  }

  /**
   * @inheritdoc
   */
  public ngOnChanges(changes: SimpleChanges): void {
    if ('registrationData' in changes) {
      this.registrationData$.next(this.registrationData);
    }
  }

  private onChanges(): void {
    this.form$
      .pipe(
        switchMap(form => form.valueChanges),
        // Checking that at least one field has value.
        map(formValue => Object.keys(formValue).some(key => !!formValue[key])),
        takeUntil(this.destroy$),
      ).subscribe(hasValue => this.isFormNotEmpty.emit(hasValue));
  }

  /**
   * On form submitted.
   */
  public onSubmitted(form: FormGroup): void {
    form.markAllAsTouched();
    if (form.invalid) {
      return;
    }
    const registrationData: Partial<ClientRegistration> = ({
      email: form.value.email as string,
      firstName: form.value.firstName as string,
      lastName: form.value.lastName as string,
      password: form.value.password as string,
      passwordConfirm: form.value.passwordConfirm as string,
      organizationName: form.value.organizationName as string,
      clientType: form.value.clientType as ClientType,
    });

    this.formSubmit.emit(registrationData);
  }

  /**
   * On "Cancel" clicked.
   */
  public onCancelClicked(): void {
    this.cancel.emit();
  }

  private createAccountFormStream(): Observable<FormGroup> {
    const data$ = this.registrationData$.pipe(
      filter(data => data != null),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );

    const form$ = data$.pipe(
      first(), // Init form only once.
      map((data) => this.createForm(data)),
      shareReplay({ bufferSize: 1, refCount: true }),
    );

    const clientTypeChange$ = form$.pipe(
      switchMap(form => {
        const clientTypeControl = form.controls.clientType;
        return clientTypeControl.valueChanges.pipe(
          startWith(clientTypeControl.value),
        );
      }),
    );

    return combineLatest([
      form$,
      clientTypeChange$,
      data$,
    ]).pipe(
      tap(this.mutateForm),
      map(([form]) => form),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
  }

  private mutateForm(this: void, [formToModify, clientType, data]: [FormGroup, ClientType, ClientRegistration]): void {
    switch (clientType) {
      case ClientType.Individual:
        if (formToModify.contains('organizationName')) {
          formToModify.removeControl('organizationName');
        }
        break;
      case ClientType.Organization:
        if (!formToModify.contains('organizationName')) {
          formToModify.addControl(
            'organizationName',
            new FormControl(data.organizationName || null, Validators.required),
          );
        }
        break;
    }
  }

  /**
   * Setup base account form for an individual client.
   */
  private createForm(data: ClientRegistration): FormGroup {
    const preselectedClientType = data && data.clientType;
    const clientType = preselectedClientType != null ?
      preselectedClientType :
      DEFAULT_SELECTED_CLIENT_TYPE;

    return this.formBuilder.group({
      firstName: [data.firstName, [Validators.required]],
      lastName: [data.lastName, [Validators.required]],
      email: [data.email, [Validators.required, Validators.email]],
      password: [data.password, [Validators.required, Validators.minLength(8)]],
      passwordConfirm: [data.passwordConfirm, [Validators.required, JusLawValidators.matchControl('password', 'Password')]],
      clientType: [clientType, [Validators.required]],
    });
  }
}

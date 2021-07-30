import { Component, ChangeDetectionStrategy, ViewChild, EventEmitter, Output, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ClientRegistration } from '@jl/common/core/models';
import { TEntityValidationErrors } from '@jl/common/core/models/api-error';
import { ClientType } from '@jl/common/core/models/client';
import { Observable, ReplaySubject, merge, of, NEVER } from 'rxjs';
import { first, tap, switchMapTo, filter } from 'rxjs/operators';

import { CreateIndividualAccountComponent } from '../create-individual-account/create-individual-account.component';

/** Create organizaton account form component. */
@Component({
  selector: 'jlc-create-organization-account',
  templateUrl: './create-organization-account.component.html',
  styleUrls: ['./create-organization-account.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateOrganizationAccountComponent {

  /** Inner form with main fields (email, password, etc.) */
  @ViewChild(CreateIndividualAccountComponent, { static: true })
  public innerForm: CreateIndividualAccountComponent;

  /** Form submission emitter. */
  @Output()
  public readonly submit = new EventEmitter<Partial<ClientRegistration>>();

  /** Client registration data. */
  @Input()
  public set data(d: Partial<ClientRegistration>) {
    this.data$.next(d);
  }

  /** Is form group disabled. */
  @Input()
  public set disabled(d: boolean) {
    this.disabled$.next(d);
  }

  /** Is form group disabled. */
  public readonly disabled$ = new ReplaySubject<boolean>(1);

  /** Validation errors. */
  @Input()
  public set validationError(e: TEntityValidationErrors<ClientRegistration>) {
    this.validationError$.next(e);
  }

  /** Data to fill the form. */
  public readonly data$ = new ReplaySubject<Partial<ClientRegistration>>(1);

  /** Form. */
  public readonly form$: Observable<FormGroup>;

  /** Inner form value. */
  public readonly innerFormValue$ = new ReplaySubject<Partial<ClientRegistration>>(1);

  /** Validation error */
  public readonly validationError$ = new ReplaySubject<TEntityValidationErrors<ClientRegistration>>(1);

  /**
   * @constructor
   * @param formBuilder Form builder.
   */
  public constructor(
    private readonly formBuilder: FormBuilder,
  ) {
    this.form$ = this.initFormStream();
  }

  /** Emit inner form value. */
  public onInnerFormSubmit(data: Partial<ClientRegistration>): void {
    this.innerFormValue$.next(data);
  }

  /** Submit form from outside. */
  public submitManually(): void {
    this.innerForm.submitManually();

    this.form$.pipe(
      first(),
    ).subscribe(form => this.onSubmit(form));
  }

  /**
   * Handle form submission.
   * @param form Form.
   */
  public onSubmit(form: FormGroup): void {
    form.markAllAsTouched();
    if (form.invalid) {
      return;
    }

    const organizationRegistrationData = form.value;
    this.innerFormValue$.pipe(
      first(),
    ).subscribe(individualRegistrationData => {
      this.submit.emit({
        ...individualRegistrationData,
        ...organizationRegistrationData,
        clientType: ClientType.Organization,
      } as Partial<ClientRegistration>);
    });
  }

  private initFormStream(): Observable<FormGroup> {
    const form = this.formBuilder.group({
      organizationName: [null, Validators.required],
    });

    const sideEffect$ = this.initFormSideEffect(form);

    return merge(of(form), sideEffect$);
  }

  private initFormSideEffect(form: FormGroup): Observable<never> {
    const fillForm$ = this.data$.pipe(
      filter(data => data != null),
      tap(data => form.patchValue({
        organizationName: data.organizationName,
      })),
      switchMapTo(NEVER),
    );

    const disableForm$ = this.disabled$.pipe(
      tap(disabled => disabled ? form.disable() : form.enable()),
    );
    return merge(
      fillForm$,
      disableForm$,
    ).pipe(
      switchMapTo(NEVER),
    );
  }
}

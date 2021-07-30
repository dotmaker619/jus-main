import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClientRegistration } from '@jl/common/core/models';
import { TEntityValidationErrors } from '@jl/common/core/models/api-error';
import { ClientType } from '@jl/common/core/models/client';
import { JusLawValidators } from '@jl/common/core/validators/validators';
import { Observable, ReplaySubject, NEVER, merge, of } from 'rxjs';
import { switchMapTo, tap, first, filter } from 'rxjs/operators';

/** Create individual account form component. */
@Component({
  selector: 'jlc-create-individual-account',
  templateUrl: './create-individual-account.component.html',
  styleUrls: ['./create-individual-account.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateIndividualAccountComponent {

  /** Validation errors. */
  @Input()
  public set validationError(e: TEntityValidationErrors<ClientRegistration>) {
    this.validationError$.next(e);
  }

  /** Validation error */
  public readonly validationError$ = new ReplaySubject<TEntityValidationErrors<ClientRegistration>>(1);

  /** Data to fill the form. */
  @Input()
  public set data(d: Partial<ClientRegistration>) {
    this.data$.next(d);
  }

  /** Is form group disabled. */
  @Input()
  public set disabled(d: boolean) {
    this.disabled$.next(d);
  }

  /** Form submission emitter. */
  @Output()
  public readonly submit = new EventEmitter<Partial<ClientRegistration>>();

  /** Data to fill the form. */
  private readonly data$ = new ReplaySubject<Partial<ClientRegistration>>(1);

  /** Is form group disabled. */
  private readonly disabled$ = new ReplaySubject<boolean>(1);

  /** Form. */
  public readonly form$: Observable<FormGroup>;

  /**
   * @constructor
   * @param formBuilder Form builder.
   */
  public constructor(
    private readonly formBuilder: FormBuilder,
  ) {
    this.form$ = this.initFormStream();
  }

  /**
   * Init form stream.
   */
  private initFormStream(): Observable<FormGroup> {
    const form = this.formBuilder.group({
      firstName: [null, [Validators.required]],
      lastName: [null, [Validators.required]],
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required, Validators.minLength(8)]],
      passwordConfirm: [null, [Validators.required, JusLawValidators.matchControl('password', 'Password')]],
    });

    const sideEffect$ = this.initFormSideEffect(form);

    return merge(of(form), sideEffect$);
  }

  /** Fill form asynchronously. */
  private initFormSideEffect(form: FormGroup): Observable<never> {
    const fillForm$ = this.data$.pipe(
      filter(data => data != null),
      tap((data) => form.patchValue({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        passwordConfirm: data.passwordConfirm,
      })),
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

  /** Allows the form to be submitted from outside. */
  public submitManually(): void {
    this.form$.pipe(
      first(),
    ).subscribe((form) => this.onSubmit(form));
  }

  /**
   * Emit form value.
   * @param form Form.
   */
  public onSubmit(form: FormGroup): void {
    form.markAllAsTouched();
    if (form.invalid) {
      return;
    }

    this.submit.emit({
      ...form.value,
      clientType: ClientType.Individual,
    });
  }
}

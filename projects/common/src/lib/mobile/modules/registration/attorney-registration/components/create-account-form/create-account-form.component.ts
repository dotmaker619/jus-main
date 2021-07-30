import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef } from '@angular/core';
import {
  ControlValueAccessor, FormGroup, FormBuilder, Validators,
  NG_VALUE_ACCESSOR, AsyncValidator, NG_ASYNC_VALIDATORS, AbstractControl, ValidationErrors,
} from '@angular/forms';
import { TEntityValidationErrors } from '@jl/common/core/models/api-error';
import { AttorneyRegistration } from '@jl/common/core/models/attorney-registration';
import { ValidationErrorCode } from '@jl/common/core/models/validation-error-code';
import { JusLawValidators } from '@jl/common/core/validators/validators';
import { ReplaySubject, Observable, merge, of, NEVER } from 'rxjs';
import { shareReplay, tap, switchMapTo, first, filter, map } from 'rxjs/operators';

type FormFields = Pick<AttorneyRegistration, 'email' | 'password' | 'passwordRepeat'>;
type OnChangeCallback = (_: FormFields) => void;
type OnTouchedCallback = () => void;

const INVALID_ERROR: ValidationErrors = {
  [ValidationErrorCode.JusLawError]: {
    message: 'Form completed errornously',
  },
};

/** Form group for creating account for an attorney. */
@Component({
  selector: 'jlc-create-account-form',
  templateUrl: './create-account-form.component.html',
  styleUrls: ['./create-account-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: CreateAccountFormComponent,
      multi: true,
    },
    {
      provide: NG_ASYNC_VALIDATORS,
      useExisting: CreateAccountFormComponent,
      multi: true,
    },
  ],
})
export class CreateAccountFormComponent implements ControlValueAccessor, AsyncValidator {

  /** Form. */
  public readonly form$: Observable<FormGroup>;
  /** Validation errors. */
  public readonly validationError$ = new ReplaySubject<TEntityValidationErrors<FormFields>>();

  /** Validation errors. */
  @Input()
  public set jlcApiValidation(err: TEntityValidationErrors<FormFields>) {
    this.validationError$.next(err);
  }

  private readonly dataChange$ = new ReplaySubject<FormFields>(1);
  private readonly isDisabled$ = new ReplaySubject<boolean>();
  private readonly touched$ = new ReplaySubject<void>(1);
  private readonly onChangeCallbacks: Array<OnChangeCallback> = [];
  private readonly onTouchedCallbacks: Array<OnTouchedCallback> = [];

  /**
   * @constructor
   * @param fb Form builder.
   * @param cdr Change detector.
   */
  public constructor(
    private readonly fb: FormBuilder,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.form$ = this.initFormStream();
  }
  /** @inheritdoc */
  public validate(_: AbstractControl): Observable<ValidationErrors> {
    return this.form$.pipe(
      first(),
      map(form => form.invalid ? INVALID_ERROR : null),
    );
  }

  /** @inheritdoc */
  public writeValue(data: FormFields): void {
    this.dataChange$.next(data);
  }
  /** @inheritdoc */
  public registerOnChange(fn: OnChangeCallback): void {
    this.onChangeCallbacks.push(fn);
  }
  /**@inheritdoc */
  public registerOnTouched(fn: OnTouchedCallback): void {
    this.onTouchedCallbacks.push(fn);
  }
  /** @inheritdoc */
  public setDisabledState?(isDisabled: boolean): void {
    this.isDisabled$.next(isDisabled);
  }

  /** Mark form group as touched. */
  public markAsTouched(): void {
    this.touched$.next();
  }

  private initFormStream(): Observable<FormGroup> {
    const form = this.fb.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, Validators.required],
      passwordRepeat: [null, [
        Validators.required,
        JusLawValidators.matchControl('password', 'Password')]],
    } as Record<keyof FormFields, Array<unknown>>);

    const formSideEffect$ = this.initFormSideEffect(form);

    return merge(of(form), formSideEffect$).pipe(
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }

  /**
   * Init form side effect stream.
   * @param form Form.
   */
  private initFormSideEffect(form: FormGroup): Observable<never> {
    const valueChange$ = form.valueChanges.pipe(
      shareReplay({ refCount: true, bufferSize: 1 }),
    );

    const fillForm$ = this.dataChange$.pipe(
      filter(data => data != null),
      tap(data => form.patchValue({
        email: data.email,
        password: data.password,
        passwordRepeat: data.passwordRepeat,
      } as FormFields, { emitEvent: false })),
    );
    const callOnTouched$ = valueChange$.pipe(
      first(),
      tap(() => this.onTouchedCallbacks.forEach(cb => cb())),
    );
    const callOnChanged$ = valueChange$.pipe(
      tap((value: FormFields) => this.onChangeCallbacks.forEach(cb => cb(value))),
    );
    const disableForm$ = this.isDisabled$.pipe(
      tap(isDisabled => isDisabled ? form.disable() : form.enable()),
    );
    const markAsTouched$ = this.touched$.pipe(
      first(),
      tap(() => {
        form.markAllAsTouched();
        this.onTouchedCallbacks.forEach(cb => cb());
        this.cdr.detectChanges();
      }),
    );
    return merge(
      fillForm$,
      callOnTouched$,
      callOnChanged$,
      disableForm$,
      markAsTouched$,
    ).pipe(
      switchMapTo(NEVER),
    );
  }
}

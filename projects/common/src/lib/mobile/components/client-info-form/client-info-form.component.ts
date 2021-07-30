import { Component, ChangeDetectionStrategy, forwardRef, Input, ChangeDetectorRef } from '@angular/core';
import {
  FormGroup, FormBuilder, Validators, ControlValueAccessor, NG_VALUE_ACCESSOR,
  ValidationErrors, AsyncValidator, NG_ASYNC_VALIDATORS,
} from '@angular/forms';
import { Client, SelectOption, ClientRegistration } from '@jl/common/core/models';
import { TEntityValidationErrors } from '@jl/common/core/models/api-error';
import { Specialty } from '@jl/common/core/models/specialty';
import { State } from '@jl/common/core/models/state';
import { ValidationErrorCode } from '@jl/common/core/models/validation-error-code';
import { SpecialtyService } from '@jl/common/core/services/specialty.service';
import { StatesService } from '@jl/common/core/services/states.service';
import { ReplaySubject, Observable, merge, NEVER, of } from 'rxjs';
import { first, tap, switchMapTo, shareReplay, map } from 'rxjs/operators';

type ClientInfoForm = Pick<Client, 'avatar' | 'helpDescription' | 'state' | 'specialties'>;

const FORM_INVALID_ERROR: ValidationErrors = {
  [ValidationErrorCode.JusLawError]: {
    message: 'Client form filled incorrectly',
  },
};

/**
 * Client info form group for mobile devices.
 */
@Component({
  selector: 'jlc-client-info-form',
  templateUrl: './client-info-form.component.html',
  styleUrls: ['./client-info-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ClientInfoFormComponent),
      multi: true,
    },
    {
      provide: NG_ASYNC_VALIDATORS,
      useExisting: forwardRef(() => ClientInfoFormComponent),
      multi: true,
    },
  ],
})
export class ClientInfoFormComponent implements ControlValueAccessor, AsyncValidator {
  /** Validation errors. */
  public readonly validationError$ = new ReplaySubject<TEntityValidationErrors<ClientRegistration>>(1);
  /** Client profile form. */
  public readonly form$: Observable<FormGroup>;
  /** States to select. */
  public readonly states$: Observable<State[]>;
  /** Specialties to select. */
  public readonly specialties$: Observable<Specialty[]>;

  /** Client subject. */
  private readonly clientChange$ = new ReplaySubject<ClientInfoForm>(1);
  /** Subject to catch touched request from outside. */
  private readonly touched$ = new ReplaySubject<void>();
  /** On change callback. */
  private onChange = (_: ClientInfoForm) => { };
  /** On touched callback. */
  private onTouched = () => { };

  /** Validation errors. */
  @Input()
  public set jlcApiValidation(e: TEntityValidationErrors<ClientRegistration>) {
    this.validationError$.next(e);
  }

  /**
   * @constructor
   * @param formBuilder Form builder.
   * @param specialtiesService Specialities service.
   * @param stateService State service.
   * @param cdr Change detector.
   */
  public constructor(
    private readonly formBuilder: FormBuilder,
    private readonly specialtiesService: SpecialtyService,
    private readonly stateService: StatesService,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.specialties$ = this.specialtiesService.getSpecialties().pipe(
      shareReplay({ bufferSize: 1, refCount: true }),
    );
    this.form$ = this.initFormStream();
    this.states$ = this.stateService.getStates();
  }

  /** @inheritdoc */
  public validate(): Observable<ValidationErrors> {
    return this.form$.pipe(
      first(),
      map(form =>
        form.invalid ? FORM_INVALID_ERROR : null),
    );
  }

  /** @inheritdoc */
  public writeValue(client: ClientInfoForm): void {
    if (client != null) {
      this.clientChange$.next(client);
    }
  }

  /** @inheritdoc */
  public registerOnChange(fn: (c: Client) => void): void {
    this.onChange = fn;
  }

  /** @inheritdoc */
  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  private initFormStream(): Observable<FormGroup> {
    const form = this.formBuilder.group({
      avatar: [null],
      specialties: [null, Validators.required],
      state: [null, Validators.required],
      helpDescription: [null, Validators.required],
    });

    const sideEffect$ = this.initFormSideEffects(form);

    return merge(of(form), sideEffect$).pipe(
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }

  private initFormSideEffects(form: FormGroup): Observable<never> {
    const valueChange$ = form.valueChanges.pipe(
      shareReplay({ refCount: true, bufferSize: 1 }),
    );

    const markAsTouched$ = this.touched$.pipe(
      first(),
      tap(() => {
        form.markAllAsTouched();
        // To explicitly ask for rendering the validation messages without emitting error subject
        this.cdr.detectChanges();
      }),
    );

    const callOnChanged$ = valueChange$.pipe(
      tap(() =>
        this.onChange(this.assembleClientInfo(form))),
    );

    const callOnTouched$ = valueChange$.pipe(
      first(),
      tap(() => this.onTouched()),
    );

    const fillForm$ = this.clientChange$.pipe(
      tap(client => form.patchValue({
        avatar: client.avatar || null,
        specialties: client.specialties || [],
        state: client.state,
        helpDescription: client.helpDescription,
      })),
    );

    return merge(
      fillForm$,
      markAsTouched$,
      callOnChanged$,
      callOnTouched$,
    ).pipe(
      switchMapTo(NEVER),
    );
  }

  /**
   * Mark form as touched.
   */
  public markAsTouched(): void {
    this.touched$.next();
  }

  /**
   * Assemble client data.
   * @param form Form.
   * @param specialties Specialties list.
   */
  public assembleClientInfo(form: FormGroup): ClientInfoForm {
    return ({
      avatar: form.value.avatar,
      specialties: form.value.specialties,
      helpDescription: form.value.helpDescription,
      state: form.value.state,
    });
  }

  /**
   * Compare function for select.
   * @param state1 State.
   * @param state2 State.
   */
  public compareStates(state1: State, state2: State): boolean {
    return (state1 && state1.id) === (state2 && state2.id);
  }

  /**
  * On profile image changed.
  * @param form Form control.
  * @param file File with an image.
  */
  public onProfileImageChanged(form: FormGroup, file: File): void {
    const avatarFormControl = form.get('avatar');
    avatarFormControl.setValue(file);
    avatarFormControl.markAsDirty();
  }
}

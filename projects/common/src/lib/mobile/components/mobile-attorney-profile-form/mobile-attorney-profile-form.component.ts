import {
  Component,
  ChangeDetectionStrategy,
  Input,
  ChangeDetectorRef,
} from '@angular/core';
import {
  FormGroup, FormBuilder, Validators,
  ControlValueAccessor, AsyncValidator, NG_VALUE_ACCESSOR, NG_ASYNC_VALIDATORS, AbstractControl, ValidationErrors,
} from '@angular/forms';
import { TEntityValidationErrors } from '@jl/common/core/models/api-error';
import { Attorney } from '@jl/common/core/models/attorney';
import { City } from '@jl/common/core/models/city';
import { Education } from '@jl/common/core/models/education';
import { FeeKind } from '@jl/common/core/models/fee-kind';
import { Specialty } from '@jl/common/core/models/specialty';
import { State } from '@jl/common/core/models/state';
import { ValidationErrorCode } from '@jl/common/core/models/validation-error-code';
import { CityService } from '@jl/common/core/services/city.service';
import { FeeKindService } from '@jl/common/core/services/fee-kind.service';
import { PlaceResult, LocationService } from '@jl/common/core/services/location.service';
import { SpecialtyService } from '@jl/common/core/services/specialty.service';
import { StatesService } from '@jl/common/core/services/states.service';
import { JusLawValidators } from '@jl/common/core/validators/validators';
import { BaseAttorneyProfileForm } from '@jl/common/shared/base-components/attorney-profile/attorney-profile-form.base';
import { Observable, ReplaySubject, merge, of, NEVER } from 'rxjs';
import { map, shareReplay, first, tap, switchMapTo, debounceTime } from 'rxjs/operators';

type FormFields =
  Pick<
    Attorney,
    'avatar' |
    'firstName' |
    'lastName' |
    'phone' |
    'education' |
    'practiceJurisdictions' |
    'licenseInfo' |
    'isDisciplined' |
    'practiceDescription' |
    'firmLocation' |
    'firmLocationData' |
    'firmPlaceId' |
    'firmLocationCity' |
    'firmLocationState' |
    'yearsOfExperience' |
    'haveSpecialty' |
    'specialties' |
    'specialtyTime' |
    'specialtyMattersCount' |
    'keywords' |
    'feeRate' |
    'feeKinds' |
    'charityOrganizations' |
    'extraInfo'>;

type FormTemplate<T> = Record<keyof T, unknown>;

type OnChangedCallback = (a: FormFields) => void;
type OnTouchedCallback = () => void;

interface ObjectWithId {
  /** Id. */
  id: number;
}

const INVALID_ERROR: ValidationErrors = {
  [ValidationErrorCode.JusLawError]: {
    message: 'Attorney profile form filled incorrectly',
  },
};
const CURRENT_YEAR = (new Date()).getFullYear();
const MIN_YEAR_VALIDATOR = Validators.min(CURRENT_YEAR - 100);
const MAX_YEAR_VALIDATOR = Validators.max(CURRENT_YEAR + 100);

/** Attorney profile form for mobile workspace. */
@Component({
  selector: 'jlc-mobile-attorney-profile-form',
  templateUrl: './mobile-attorney-profile-form.component.html',
  styleUrls: ['./mobile-attorney-profile-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: MobileAttorneyProfileFormComponent,
      multi: true,
    },
    {
      provide: NG_ASYNC_VALIDATORS,
      useExisting: MobileAttorneyProfileFormComponent,
      multi: true,
    },
  ],
})
export class MobileAttorneyProfileFormComponent extends BaseAttorneyProfileForm implements ControlValueAccessor, AsyncValidator {
  /**
   * Attorney data.
   */
  @Input()
  public set attorneyData(attorney: Attorney) {
    if (attorney != null) {
      this.attorneyData$.next(attorney);
    }
  }
  /**
   * Attorney validation error.
   */
  @Input()
  public set jlcApiValidation(err: TEntityValidationErrors<Attorney>) {
    this.validationError$.next(err);
  }
  /**
   * Disabled state for name fields.
   */
  @Input()
  public set namesDisabled(disabled: boolean) {
    this.namesDisabledChange$.next(disabled);
  }
  /**
   * Form group.
   */
  public readonly form$: Observable<FormGroup>;
  /**
   * State options.
   */
  public readonly states$: Observable<State[]>;
  /**
   * City options.
   */
  public readonly cities$: Observable<City[]>;
  /**
   * Attorney stream to make more convinient work.
   */
  public readonly attorneyData$ = new ReplaySubject<Attorney>(1);
  /**
   * Wrap validation error data to Observable to easy integrate with other parts of the page.
   */
  public readonly validationError$ = new ReplaySubject<TEntityValidationErrors<Attorney>>(1);
  /**
   * Feekinds.
   */
  public readonly feeKinds$: Observable<FeeKind[]>;
  /**
   * Specialties.
   */
  public readonly specialties$: Observable<Specialty[]>;
  /**
   * Validation error for Firm Location.
   */
  public readonly firmLocationValidationError$: Observable<string>;

  private readonly touched$ = new ReplaySubject<void>(1);
  private readonly namesDisabledChange$ = new ReplaySubject<boolean>(1);
  private readonly onChangeCallbacks: Array<OnChangedCallback> = [];
  private readonly onTouchedCallbacks: Array<OnTouchedCallback> = [];

  /**
   * @constructor
   * @param fb Form builder.
   * @param stateService State service.
   * @param specialtyService Specialty service.
   * @param feeKindService Fee kind service.
   * @param cityService City service.
   * @param locationService Location service.
   * @param cdr Change detector.
   */
  public constructor(
    private readonly fb: FormBuilder,
    private readonly stateService: StatesService,
    private readonly specialtyService: SpecialtyService,
    private readonly feeKindService: FeeKindService,
    private readonly cityService: CityService,
    private readonly locationService: LocationService,
    private readonly cdr: ChangeDetectorRef,
  ) {
    super();
    this.states$ = this.initStatesStream();
    this.specialties$ = this.initSpecialitiesStream();
    this.feeKinds$ = this.initFeeKindsStream();
    this.cities$ = this.initCitiesStream();
    this.form$ = this.initFormStream();
    this.firmLocationValidationError$ = this.createFirmLocationValidationErrorStream(this.validationError$);
  }

  /** @inheritdoc */
  public writeValue(data: Attorney): void {
    this.attorneyData = data;
  }

  /** @inheritdoc */
  public registerOnChange(fn: OnChangedCallback): void {
    this.onChangeCallbacks.push(fn);
  }

  /** @inheritdoc */
  public registerOnTouched(fn: OnTouchedCallback): void {
    this.onTouchedCallbacks.push(fn);
  }

  /** @inheritdoc */
  public setDisabledState?(isDisabled: boolean): void {
    throw new Error('Method not implemented.');
  }

  /** @inheritdoc */
  public validate(_: AbstractControl): Observable<ValidationErrors | null> {
    return this.form$.pipe(
      first(),
      map(form => form.invalid ? INVALID_ERROR : null),
    );
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
  /**
   * Mark form group as touched.
   */
  public markAsTouched(): void {
    this.touched$.next();
  }

  private initFormStream(): Observable<FormGroup> {
    const form = this.createForm();
    const valueChanges$ = form.valueChanges.pipe(
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
    const fillForm$ = this.attorneyData$.pipe(
      first(),
      tap(data => this.updateFormValue(form, data, false)),
    );
    const callOnTouched$ = valueChanges$.pipe(
      first(),
      tap(() => this.onTouchedCallbacks.forEach(cb => cb())),
    );
    const callOnChange$ = valueChanges$.pipe(
      debounceTime(200),
      tap(() => this.onChangeCallbacks.forEach(cb => cb(this.formValuesToData(form)))),
    );
    const touchedChange$ = this.touched$.pipe(
      first(),
      tap(() => {
        form.markAllAsTouched();
        this.onTouchedCallbacks.forEach(cb => cb());
        // To display validation messages
        this.cdr.detectChanges();
      }),
    );
    const disabledStateChange$ = this.namesDisabledChange$.pipe(
      tap(namesDisabled => {
        if (namesDisabled) {
          form.controls.firstName.disable();
          form.controls.lastName.disable();
        } else {
          form.controls.firstName.enable();
          form.controls.lastName.enable();
        }
      }),
    );
    const formSideEffect$ = merge(
      fillForm$,
      callOnTouched$,
      callOnChange$,
      touchedChange$,
      disabledStateChange$,
    ).pipe(
      switchMapTo(NEVER),
    );
    return merge(of(form), formSideEffect$).pipe(
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
  }

  private updateFormValue(form: FormGroup, data: FormFields, emitEvent: boolean = true): void {
    form.patchValue({
      ...data,
      education: data.education == null ? {} : data.education,
    }, {
      emitEvent,
    });
  }

  private createForm(): FormGroup {
    const form = this.fb.group({
      avatar: [null, Validators.required],
      firstName: [null, Validators.required],
      lastName: [null, Validators.required],
      phone: [null, Validators.required],
      education: this.fb.group({
        id: [],
        university: [null, Validators.required],
        year: [null, [Validators.required, MIN_YEAR_VALIDATOR, MAX_YEAR_VALIDATOR]],
      } as FormTemplate<Education>),
      practiceJurisdictions: [[], JusLawValidators.minItems(1)],
      licenseInfo: [null, Validators.required],
      isDisciplined: [null, Validators.required],
      practiceDescription: [null, Validators.maxLength(1000)],
      firmLocationData: [null, Validators.required],
      yearsOfExperience: [null, Validators.required],
      haveSpecialty: [null],
      specialties: [[], JusLawValidators.minItems(1)],
      specialtyTime: [null],
      specialtyMattersCount: [null],
      keywords: [null],
      feeRate: [null, Validators.required],
      feeKinds: [[], JusLawValidators.minItems(1)],
      charityOrganizations: [null],
      extraInfo: [null],
    } as FormTemplate<FormFields>);

    return form;
  }

  private initStatesStream(): Observable<State[]> {
    return this.stateService.getStates()
      .pipe(shareReplay({ bufferSize: 1, refCount: true }));
  }

  private initSpecialitiesStream(): Observable<Specialty[]> {
    return this.specialtyService.getSpecialties()
      .pipe(shareReplay({ bufferSize: 1, refCount: true }));
  }

  private initFeeKindsStream(): Observable<FeeKind[]> {
    return this.feeKindService.getFeeKinds()
      .pipe(shareReplay({ bufferSize: 1, refCount: true }));
  }

  private initCitiesStream(): Observable<City[]> {
    return this.cityService.getCities()
      .pipe(shareReplay({ bufferSize: 1, refCount: true }));
  }

  private formValuesToData(form: FormGroup): FormFields {
    // Avoid error of save phone.
    const phone = (/^\+/g).test(form.value.phone)
      ? form.value.phone
      : `+1${form.value.phone}`;

    const firmLocationCity = this.extractFirmLocationCity(form.value.firmLocationData);
    const firmLocationState = this.extractFirmLocationState(form.value.firmLocationData);

    return ({
      ...this.attorneyData,
      avatar: form.value.avatar as File,
      lastName: form.value.lastName as string,
      firstName: form.value.firstName as string,
      phone,
      education: form.value.education,
      isDisciplined: form.value.isDisciplined as boolean,
      practiceJurisdictions: form.value.practiceJurisdictions,
      licenseInfo: form.value.licenseInfo as string,
      practiceDescription: form.value.practiceDescription as string,
      firmPlaceId: form.value.firmLocationData && form.value.firmLocationData.place_id,
      firmLocation: this.locationService.getCoordinatesFromPlaceResult(form.value.firmLocationData),
      firmLocationData: form.value.firmLocationData as PlaceResult,
      firmLocationCity: firmLocationCity,
      firmLocationState: firmLocationState,
      yearsOfExperience: form.value.yearsOfExperience as number,
      haveSpecialty: form.value.haveSpecialty as boolean,
      specialties: form.value.specialties,
      specialtyTime: form.value.specialtyTime as number,
      specialtyMattersCount: form.value.specialtyMattersCount as number,
      keywords: form.value.keywords as string,
      feeRate: form.value.feeRate as string,
      feeKinds: form.value.feeKinds,
      charityOrganizations: form.value.charityOrganizations as string,
      extraInfo: form.value.extraInfo as string,
    });
  }

  /**
   * Compares objects by id.
   * @param obj1 Object to compare.
   * @param obj2 Another object to compare with.
   */
  public compareById(obj1: ObjectWithId, obj2: ObjectWithId): boolean {
    return (obj1 && obj1.id) === (obj2 && obj2.id);
  }
}

import { Component, ChangeDetectionStrategy, EventEmitter, Output, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Validators, FormGroup, FormBuilder, FormControl, FormArray } from '@angular/forms';
import { FormCheckboxesSelect } from '@jl/common/core/forms';
import { TEntityValidationErrors } from '@jl/common/core/models/api-error';
import { Attorney } from '@jl/common/core/models/attorney';
import { City } from '@jl/common/core/models/city';
import { FeeKind } from '@jl/common/core/models/fee-kind';
import { Specialty } from '@jl/common/core/models/specialty';
import { State } from '@jl/common/core/models/state';
import { CityService } from '@jl/common/core/services/city.service';
import { FeeKindService } from '@jl/common/core/services/fee-kind.service';
import { LocationService, PlaceResult } from '@jl/common/core/services/location.service';
import { SpecialtyService } from '@jl/common/core/services/specialty.service';
import { StatesService } from '@jl/common/core/services/states.service';
import { compareWithId } from '@jl/common/core/utils/compare-with';
import { triggerValidation } from '@jl/common/core/utils/form-trigger';
import { JusLawValidators } from '@jl/common/core/validators/validators';
import { DialogsService } from '@jl/common/shared/modules/dialogs/dialogs.service';
import { Observable, combineLatest, BehaviorSubject, ReplaySubject } from 'rxjs';
import { map, filter, shareReplay, take } from 'rxjs/operators';

import { BaseAttorneyProfileForm } from '../../base-components/attorney-profile/attorney-profile-form.base';

const CURRENT_YEAR = (new Date()).getFullYear();
const MIN_YEAR_VALIDATOR = Validators.min(CURRENT_YEAR - 100);
const MAX_YEAR_VALIDATOR = Validators.max(CURRENT_YEAR + 100);

/**
 * Attorney profile form.
 */
@Component({
  selector: 'jlc-attorney-profile-form',
  templateUrl: './attorney-profile-form.component.html',
  styleUrls: ['./attorney-profile-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttorneyProfileFormComponent extends BaseAttorneyProfileForm implements OnChanges {

  /**
   * @constructor
   *
   * @param fb Form builder.
   * @param stateService State service.
   * @param specialtyService Specialty service.
   * @param feeKindService Fee kind service.
   * @param cityService City service.
   * @param dialogService Dialog service.
   * @param locationService Location service.
   */
  public constructor(
    private fb: FormBuilder,
    private stateService: StatesService,
    private specialtyService: SpecialtyService,
    private feeKindService: FeeKindService,
    private cityService: CityService,
    private dialogService: DialogsService,
    private locationService: LocationService,
  ) {
    super();
    this.states$ = this.stateService.getStates().pipe(shareReplay({ bufferSize: 1, refCount: true }));
    this.specialties$ = this.specialtyService.getSpecialties().pipe(shareReplay({ bufferSize: 1, refCount: true }));
    this.feeKinds$ = this.feeKindService.getFeeKinds().pipe(shareReplay({ bufferSize: 1, refCount: true }));
    this.cities$ = this.cityService.getCities();
    this.firmLocationValidationError$ = this.createFirmLocationValidationErrorStream(this.validationError$);

    // Init after all data streams initialized.
    this.additionalDataForm$ = this.createFormStream();
  }

  /**
   * Attorney data.
   */
  @Input()
  public attorneyData: Attorney;

  /**
   * Attorney validation error.
   */
  @Input()
  public validationError: TEntityValidationErrors<Attorney> = {};

  /**
   * Text for submit button.
   */
  @Input()
  public submitButtonText = 'Save';

  /**
   * Controlling display text hint.
   */
  @Input()
  public isRegistration = false;

  /**
   * Attorney data.
   */
  @Output()
  public formSubmit = new EventEmitter<Attorney>();

  /**
   * Cancel current step event.
   */
  @Output()
  public back = new EventEmitter<Attorney>();

  /**
   * Cancel current step event.
   */
  @Output()
  public cancel = new EventEmitter<void>();

  /**
   * State options.
   */
  public readonly states$: Observable<State[]>;

  /**
   * Specialty options.
   */
  public readonly specialties$: Observable<Specialty[]>;

  /**
   * Fee kind options.
   */
  public readonly feeKinds$: Observable<FeeKind[]>;

  /**
   * City options.
   */
  public cities$: Observable<City[]>;

  /**
   * From group for attorney registration personal data.
   */
  public readonly additionalDataForm$: Observable<FormGroup>;

  /**
   * Wrap registration data to Observable to easy integrate with other parts of the page.
   */
  private readonly attorneyData$ = new ReplaySubject<Attorney>(1);

  /**
   * Wrap validation error data to Observable to easy integrate with other parts of the page.
   */
  public readonly validationError$ = new BehaviorSubject<TEntityValidationErrors<Attorney>>(this.validationError);

  /**
    * Validation error for Firm Location.
    * We need that because we use single form control for multiple model properties.
    */
  public readonly firmLocationValidationError$: Observable<string>;

  /**
   * Compare with ID function for select elements.
   */
  public compareWithIdFn = compareWithId;

  private createFormStream(): Observable<FormGroup> {
    // Need `take(1)` for don't reinsert data into the form after form submit.
    // Because don't work value accessor in `location-autocomplete.directive`.
    return combineLatest(this.attorneyData$, this.specialties$, this.feeKinds$)
      .pipe(
        take(1),
        filter(([data]) => data != null),
        map(([attorneyData, specialties, feeKinds]) =>
          this.createForm(attorneyData, specialties, feeKinds),
        ),
      );
  }

  /**
   * Create Form.
   *
   * @param attorney Attorney data.
   * @param specialties Specialties list.
   * @param feeKinds Fee kinds list.
   */
  private createForm(attorney: Attorney, specialties: Specialty[], feeKinds: FeeKind[]): FormGroup {
    const isSpecialtySelected = (specialty: Specialty) =>
      attorney.specialties.some(selectedSpecialty => selectedSpecialty.id === specialty.id);
    const specialtiesFormArray = new FormCheckboxesSelect<Specialty>(specialties, isSpecialtySelected, Validators.required);

    const isFeeKindSelected = (feeKind: FeeKind) =>
      attorney.feeKinds.some(selectedFeeKind => selectedFeeKind.id === feeKind.id);
    const feeKindsFormArray = new FormCheckboxesSelect<FeeKind>(feeKinds, isFeeKindSelected, Validators.required);

    const practiceJurisdictionsFormArray = attorney.practiceJurisdictions.length > 0
      ? new FormArray(attorney.practiceJurisdictions.map(state =>
        new FormControl(state)), JusLawValidators.hasNotNullValue('practiceJurisdictions', 'Practice Jurisdictions'))
      : new FormArray([new FormControl(null)], JusLawValidators.hasNotNullValue('practiceJurisdictions', 'Practice Jurisdictions'));

    const form = this.fb.group({
      avatar: [attorney.avatar, Validators.required],
      firstName: [attorney.firstName, Validators.required],
      lastName: [attorney.lastName, Validators.required],
      phone: [attorney.phone, Validators.required],
      education: this.fb.group({
        id: [attorney.education && attorney.education.id],
        university: [attorney.education && attorney.education.university, Validators.required],
        year: [attorney.education && attorney.education.year, [Validators.required, MIN_YEAR_VALIDATOR, MAX_YEAR_VALIDATOR]],
      }),
      practiceJurisdictions: practiceJurisdictionsFormArray,
      licenseInfo: [attorney.licenseInfo, Validators.required],
      isDisciplined: [attorney.isDisciplined, Validators.required],
      practiceDescription: [attorney.practiceDescription, Validators.maxLength(1000)],
      firmLocationData: [attorney.firmLocationData, Validators.required],
      yearsOfExperience: [attorney.yearsOfExperience, Validators.required],
      haveSpecialty: [attorney.haveSpecialty],
      specialties: specialtiesFormArray,
      specialtyTime: [attorney.specialtyTime],
      specialtyMattersCount: [attorney.specialtyMattersCount],
      keywords: [attorney.keywords],
      feeRate: [attorney.feeRate, Validators.required],
      feeKinds: feeKindsFormArray,
      charityOrganizations: [attorney.charityOrganizations],
      extraInfo: [attorney.extraInfo],
    });

    if (!this.isRegistration) {
      form.controls.firstName.disable();
      form.controls.lastName.disable();
    }

    return form;
  }

  private formValuesToData(form: FormGroup): Attorney {
    // Avoid error of save phone.
    const phone = (/^\+/g).test(form.value.phone)
      ? form.value.phone
      : `+1${form.value.phone}`;

    const firmLocationCity = this.extractFirmLocationCity(form.value.firmLocationData);
    const firmLocationState = this.extractFirmLocationState(form.value.firmLocationData);

    return new Attorney({
      ...this.attorneyData,
      avatar: form.value.avatar as File,
      lastName: form.value.lastName as string,
      firstName: form.value.firstName as string,
      phone,
      education: form.value.education, // TODO:
      isDisciplined: form.value.isDisciplined as boolean,
      practiceJurisdictions: (form.value.practiceJurisdictions as State[]).filter(value => value != null),
      licenseInfo: form.value.licenseInfo as string,
      practiceDescription: form.value.practiceDescription as string,
      firmPlaceId: form.value.firmLocationData && form.value.firmLocationData.place_id,
      firmLocation: this.locationService.getCoordinatesFromPlaceResult(form.value.firmLocationData),
      firmLocationData: form.value.firmLocationData as PlaceResult,
      firmLocationCity: firmLocationCity,
      firmLocationState: firmLocationState,
      yearsOfExperience: form.value.yearsOfExperience as number,
      haveSpecialty: form.value.haveSpecialty as boolean,
      specialties: form.value.specialties as Specialty[] || [],
      specialtyTime: form.value.specialtyTime as number,
      specialtyMattersCount: form.value.specialtyMattersCount as number,
      keywords: form.value.keywords as string,
      feeRate: form.value.feeRate as string,
      feeKinds: form.value.feeKinds as FeeKind[] || [],
      charityOrganizations: form.value.charityOrganizations as string,
      extraInfo: form.value.extraInfo as string,
    });
  }

  /**
   * @inheritdoc
   */
  public ngOnChanges(changes: SimpleChanges): void {
    if ('attorneyData' in changes && this.attorneyData != null) {
      // Re-create a form after every data change.
      this.attorneyData$.next(this.attorneyData);
    }
    if ('validationError' in changes) {
      this.validationError$.next(this.validationError);
    }
  }

  /**
   * Run on form submission.
   */
  public onFormSubmitted(form: FormGroup): void {
    form.markAllAsTouched();
    triggerValidation(form);
    if (form.valid) {
      this.formSubmit.emit(this.formValuesToData(form));
    } else {
      this.dialogService.showValidationError();
    }
  }

  /**
   * On "Cancel" button clicked.
   */
  public onCancelClicked(): void {
    this.cancel.emit();
  }

  /**
   * On profile image changed.
   *
   * @param form Form control.
   * @param file File with an image.
   */
  public onProfileImageChanged(form: FormGroup, file: File): void {
    const avatarFormControl = form.get('avatar') as FormControl;
    avatarFormControl.setValue(file);
    avatarFormControl.markAsDirty();
  }

  /**
   * Control display add practice jurisdictions button.
   */
  public displayPracticeJurisdictionsAddButton(form: FormGroup, index: number): boolean {
    const lastIndex = form.value.practiceJurisdictions.length - 1;
    return lastIndex === index && form.value.practiceJurisdictions[lastIndex];
  }

  /**
   * Add practice jurisdiction select control.
   */
  public onAddPracticeJurisdictionClicked(form: FormGroup): void {
    const practiceJurisdictions = form.get('practiceJurisdictions') as FormArray;
    practiceJurisdictions.push(new FormControl(null));
  }

  /**
   * Control display remove practice jurisdictions button.
   */
  public displayPracticeJurisdictionsRemoveButton(form: FormGroup): boolean {
    return form.value.practiceJurisdictions.length > 1;
  }

  /**
   * Remove practice jurisdiction select control.
   */
  public onRemovePracticeJurisdictionClicked(form: FormGroup, jurisdictionState: State): void {
    const practiceJurisdictions = form.get('practiceJurisdictions') as FormArray;
    practiceJurisdictions.removeAt(practiceJurisdictions.value.findIndex((state: State) => {
      if (jurisdictionState === null) { // Empty control.
        return state === jurisdictionState;
      }
      return state.id === jurisdictionState.id;
    }));
  }

  /**
   * Handle the Back button click.
   */
  public onBackClicked(form: FormGroup): void {
    this.back.emit(this.formValuesToData(form));
  }

  /**
   * Return filtered practice jurisdiction states.
   *
   * @description Doesn't show practice jurisdiction state if this already selected.
   *
   * @param currentState Current selected practice jurisdiction state.
   * @param allSelectedStates All selected practice jurisdiction states.
   */
  public getJurisdictionStates(currentState: State, allSelectedStates: State[]): Observable<State[]> {
    const currentSelectedStateId = currentState && currentState.id;
    const ignoredStatesIds = new Set<number>(allSelectedStates
      .filter((state: State) => state && state.id !== currentSelectedStateId)
      .map(({ id }) => id));

    return this.states$.pipe(
      map(states => ignoredStatesIds.size !== 0
        ? states.filter(({ id }) => !ignoredStatesIds.has(id))
        : states,
      ),
    );
  }

}

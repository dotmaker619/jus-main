import { Component, ChangeDetectionStrategy, Input, EventEmitter, Output, SimpleChanges, OnChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { FormCheckboxesSelect } from '@jl/common/core/forms';
import { TEntityValidationErrors } from '@jl/common/core/models/api-error';
import { Client } from '@jl/common/core/models/client';
import { Specialty } from '@jl/common/core/models/specialty';
import { State } from '@jl/common/core/models/state';
import { SpecialtyService } from '@jl/common/core/services/specialty.service';
import { StatesService } from '@jl/common/core/services/states.service';
import { compareWithId } from '@jl/common/core/utils/compare-with';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { shareReplay, filter, map, share } from 'rxjs/operators';

/**
 * Client additional information component.
 */
@Component({
  selector: 'jlc-client-additional-info',
  templateUrl: './client-additional-info.component.html',
  styleUrls: ['./client-additional-info.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientAdditionalInfoComponent implements OnChanges {

  /**
   * Additional info.
   */
  @Input()
  public additionalInfo: Client;

  /**
   * API validation errors.
   */
  @Input()
  public validationError: TEntityValidationErrors<Client>;

  /**
   * Controlling display text hint.
   */
  @Input()
  public isRegistration = false;

  /**
   * Form submit event.
   */
  @Output()
  public readonly formSubmit = new EventEmitter<Client>();

  /**
   * Cancel current step event.
   */
  @Output()
  public back = new EventEmitter<Client>();

  /**
   * Cancel event.
   */
  @Output()
  public readonly cancel = new EventEmitter<void>();

  /**
   * Form control.
   */
  public readonly form$: Observable<FormGroup>;

  /**
   * Specialties.
   */
  public readonly specialties$: Observable<Specialty[]>;

  /**
   * States.
   */
  public readonly states$: Observable<State[]>;

  /**
   * Compare with ID function for select elements.
   */
  public compareWithIdFn = compareWithId;

  /**
   * Registration data Observable wrapper.
   */
  private readonly additionalInfo$ = new BehaviorSubject<Client>(this.additionalInfo);

  /**
   * @constructor
   *
   * @param formBuilder Form builder.
   * @param specialtiesService Specialties service.
   * @param stateService State service.
   */
  public constructor(
    private formBuilder: FormBuilder,
    private specialtiesService: SpecialtyService,
    private stateService: StatesService,
  ) {
    this.specialties$ = this.specialtiesService.getSpecialties()
      .pipe(
        shareReplay({ refCount: true, bufferSize: 1 }),
      );
    this.states$ = this.stateService.getStates();
    this.form$ = this.createFormStream();
  }

  private createForm(data: Client, specialties: Specialty[]): FormGroup {
    const isSpecialtySelected = (specialty) => data.specialties.some(selectedSpecialty => selectedSpecialty.id === specialty.id);
    const specialtiesFormArray = new FormCheckboxesSelect<Specialty>(specialties, isSpecialtySelected, Validators.required);
    return this.formBuilder.group({
      avatar: [data.avatar],
      specialties: specialtiesFormArray,
      state: [data.state, Validators.required],
      helpDescription: [data.helpDescription],
    });
  }

  private createFormStream(): Observable<FormGroup> {
    return combineLatest(this.additionalInfo$, this.specialties$)
      .pipe(
        filter(([data]) => data != null),
        map(([data, specialties]) => this.createForm(data, specialties)),
        share(),
      );
  }

  /**
   * @inheritdoc
   */
  public ngOnChanges(changes: SimpleChanges): void {
    if ('additionalInfo' in changes) {
      this.additionalInfo$.next(this.additionalInfo);
    }
  }

  /**
   * On form submitted.
   *
   * @param form Form control.
   */
  public onSubmitted(form: FormGroup): void {
    form.markAllAsTouched();
    if (form.invalid) {
      return;
    }
    const additionalInfo = this.mapFormValuesToData(form);
    this.formSubmit.emit(additionalInfo);
  }

  /**
   * On "Cancel" clicked.
   */
  public onCancelClicked(): void {
    this.cancel.emit();
  }

  /**
   * Handle the Back button click.
   */
  public onBackClicked(form: FormGroup): void {
    // Extract entered data and return them to save if a user goes to previous step.
    const additionalInfo = this.mapFormValuesToData(form);
    this.back.emit(additionalInfo);
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

  private mapFormValuesToData(form: FormGroup): Client {
    return new Client({
      ...this.additionalInfo,
      avatar: form.value.avatar as File,
      specialties: form.value.specialties as Specialty[],
      state: form.value.state as State,
      helpDescription: form.value.helpDescription as string,
    });
  }
}

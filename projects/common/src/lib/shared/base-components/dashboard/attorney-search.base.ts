import { EventEmitter, Output, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AttorneySearchInfo } from '@jl/common/core/models/attorney-search-info';
import { Specialty } from '@jl/common/core/models/specialty';
import { AppConfigService } from '@jl/common/core/services/app-config.service';
import { PlaceResult } from '@jl/common/core/services/location.service';
import { SpecialtyService } from '@jl/common/core/services/specialty.service';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

/**
 * Base class for attorney search components.
 */
export class AttorneySearchBase implements OnChanges {

  /**
   * Client dashboard video source.
   */
  public readonly videoURL = this.appConfig.clientDashboardVideoUrl;

  /**
   * Search form.
   */
  public readonly form: FormGroup;

  /**
   * List of available specialities to select.
   */
  public readonly specialities$: Observable<Specialty[]>;

  /**
   * Place.
   */
  @Input()
  public place: PlaceResult;

  /**
   * Initial speciality.
   */
  @Input()
  public initialSpeciality: Specialty;

  /**
   * Name.
   */
  @Input()
  public name: string;

  /**
   * Event on search click.
   */
  @Output()
  public search = new EventEmitter<AttorneySearchInfo>();

  /**
   * @constructor
   *
   * @param formBuilder Form builder service.
   * @param specialtyService Specialty service
   * @param appConfig Application config service.
   */
  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly specialtyService: SpecialtyService,
    private readonly appConfig: AppConfigService,
  ) {
    this.specialities$ = this.specialtyService.getSpecialties().pipe(
      shareReplay({ bufferSize: 1, refCount: true }),
    );

    this.form = this.formBuilder.group({
      speciality: [null],
      place: [null],
      name: [null],
    });
  }

  /**
   * @inheritdoc
   */
  public ngOnChanges(changes: SimpleChanges): void {
    if ('place' in changes && this.place != null) {
      this.form.get('place').setValue(this.place);
    }

    if ('initialSpeciality' in changes && this.initialSpeciality != null) {
      this.form.get('speciality').setValue(this.initialSpeciality.id);
    }

    if ('name' in changes && this.name != null) {
      this.form.get('name').setValue(this.name);
    }
  }

  /**
   * Return form data.
   */
  private getFormData(form: FormGroup): AttorneySearchInfo {
    const formData = form.value;

    // For an empty location field place might be an object without location (?)
    const place = formData.place && formData.place.geometry && formData.place.geometry.location;
    return {
      longitude: place && place.lng(),
      latitude: place && place.lat(),
      specialityId: formData.speciality,
      name: formData.name,
    } as AttorneySearchInfo;
  }

  /**
   * Event on search button click.;
   */
  public onSearchFormSubmitted(form: FormGroup): void {
    form.markAllAsTouched();
    if (form.valid) {
      this.search.emit(this.getFormData(form));
    }
  }

  /**
   * TrackBy function for specialties list.
   *
   * @param _ Idx.
   * @param item Specialty.
   */
  public trackSpecialties(_: number, item: Specialty): number {
    return item.id;
  }
}

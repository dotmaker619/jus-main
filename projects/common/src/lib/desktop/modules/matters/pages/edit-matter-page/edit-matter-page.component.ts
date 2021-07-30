import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TEntityValidationErrors } from '@jl/common/core/models/api-error';
import { City } from '@jl/common/core/models/city';
import { Client } from '@jl/common/core/models/client';
import { Country } from '@jl/common/core/models/country';
import { JusLawFile } from '@jl/common/core/models/juslaw-file';
import { Matter } from '@jl/common/core/models/matter';
import { MatterStatus } from '@jl/common/core/models/matter-status';
import { catchValidationError } from '@jl/common/core/rxjs';
import { LeadsService } from '@jl/common/core/services/attorney/leads.service';
import { MattersService } from '@jl/common/core/services/attorney/matters.service';
import { CityService } from '@jl/common/core/services/city.service';
import { CountriesService } from '@jl/common/core/services/countries.service';
import { ESignService } from '@jl/common/core/services/esign.service';
import { ExternalResourcesService } from '@jl/common/core/services/external-resources.service';
import { RateTypeService } from '@jl/common/core/services/rate-type.service';
import { StatesService } from '@jl/common/core/services/states.service';
import { UrlsService } from '@jl/common/core/services/urls.service';
import { UsersService } from '@jl/common/core/services/users.service';
import { compareWithId } from '@jl/common/core/utils/compare-with';
import {
  getAvailableDocuSignTypesAsMimeTypes,
} from '@jl/common/core/utils/docusign-restrictions';
import { JuslawFiles } from '@jl/common/core/utils/juslaw-files';
import { trackById } from '@jl/common/core/utils/trackby-id';
import { DialogsService } from '@jl/common/shared';
import { of, Subject, throwError, EMPTY, BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { first, catchError, switchMap, map, shareReplay, mapTo, tap } from 'rxjs/operators';

const SUCCESS_DIALOG_INFO = {
  title: 'Agreement Document Sent',
  message: 'A new matter has been created and to continue you will be redirected to DocuSign profile to complete process.',
};

const VALIDATION_ERROR_DIALOG_INFO = {
  title: 'Error saving matter',
  message: 'Form completed erroneously.',
};

const PAGE_TITLES = {
  edit: 'Edit Matter',
  create: 'Create New Matter',
};

/** Matter statuses at which we should disable client field.  */
const DISABLE_CLIENT_STATUSES = [
  MatterStatus.Pending,
  MatterStatus.Draft,
];

/** Create matter page component. */
@Component({
  selector: 'jlc-edit-matter-page',
  templateUrl: './edit-matter-page.component.html',
  styleUrls: ['./edit-matter-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditMatterPageComponent {

  /**
   * @constructor
   * @param formBuilder Form builder.
   * @param matterService Matter sereviice.
   * @param rateTypeService Rate type service.
   * @param statesService States service.
   * @param countriesService Countries service.
   * @param usersService Users service.
   * @param citiesService Cities service.
   * @param dialogService Dialog service.
   * @param router Router.
   * @param activatedRoute Actiavted route.
   * @param eSignService Esign service.
   * @param externalResourcesService External resources service.
   * @param urlsService Urls service.
   */
  public constructor(
    protected readonly formBuilder: FormBuilder,
    protected readonly matterService: MattersService,
    protected readonly rateTypeService: RateTypeService,
    protected readonly statesService: StatesService,
    protected readonly countriesService: CountriesService,
    protected readonly usersService: UsersService,
    protected readonly citiesService: CityService,
    protected readonly dialogService: DialogsService,
    protected readonly router: Router,
    protected readonly activatedRoute: ActivatedRoute,
    protected readonly eSignService: ESignService,
    protected readonly externalResourcesService: ExternalResourcesService,
    protected readonly urlsService: UrlsService,
    protected readonly leadsService: LeadsService,
  ) {

    this.clientId = this.activatedRoute.snapshot.queryParams.client == null
      ? null
      : parseInt(this.activatedRoute.snapshot.queryParams.client, 10);
    this.matterId = this.activatedRoute.snapshot.params.id == null
      ? null
      : parseInt(this.activatedRoute.snapshot.params.id, 10);
    this.leadId = this.activatedRoute.snapshot.queryParams.lead == null
      ? null
      : parseInt(this.activatedRoute.snapshot.queryParams.lead, 10);
    this.pageTitle = this.matterId == null
      ? PAGE_TITLES.create
      : PAGE_TITLES.edit;
    this.countries$ = this.createCountriesStream();
    this.form$ = this.createFormStream(this.countries$, this.clients$);
    this.cities$ = this.createCitiesForAutocompleteStream(this.form$);
  }

  /** Available filetypes for uploading to docusign. */
  public readonly availableDocumentMimeTypes: string[] = getAvailableDocuSignTypesAsMimeTypes();

  /** Page heading. */
  public readonly pageTitle: string;

  /** Is loading. */
  public readonly isLoading$ = new BehaviorSubject<boolean>(false);

  /** Wrap validation error data to Observable. */
  public readonly validationError$ = new Subject<TEntityValidationErrors<Client>>();

  /** Matter form control. */
  public readonly form$: Observable<FormGroup>;

  /** Options for client field. */
  public readonly clients$ = this.usersService.getClientsForAttorney().pipe(first());

  /** Options for state field. */
  public readonly states$ = this.statesService.getStates().pipe(first());

  /** Options for country field. */
  public readonly countries$: Observable<Country[]>;

  /** Options for rateType field. */
  public readonly rateTypes$ = this.rateTypeService.getRateTypeOptions().pipe(first());

  /** Options for city field. */
  public readonly cities$: Observable<City[]>;

  /** Matter id. */
  public readonly matterId: number;

  /** Selected client. */
  public readonly clientId: number;

  /** Initial lead. */
  public readonly leadId: number;

  /** Compare with ID function for select elements. */
  public compareWithIdFn = compareWithId;

  /** File validators. */
  public fileValidators = [
    JuslawFiles.validateForRestrictedTypes,
    JuslawFiles.validateForSizeLimitation,
  ];

  /** Trackby function. */
  public trackById = trackById;

  /** Handle errors change event. */
  public onErrorsChange(errors: string[]): void {
    if (errors.length > 0) {
      this.dialogService.showInformationDialog({
        title: 'Error',
        message: errors.join('\n'),
      });
    }
  }

  /** Save matter. */
  public onFormSubmitted(form: FormGroup): void {
    form.markAllAsTouched();
    if (form.invalid) {
      this.presentValidationErrorMessage();
      return;
    }

    this.isLoading$.next(true);

    const matter = this.formValuesToMatter(form);
    let saveMatter$: Observable<Matter>;
    if (this.leadId) {
      saveMatter$ = this.leadsService.getLeadById(this.leadId).pipe(
        catchError(() => of(null)),
        switchMap(lead => {
          if (lead) {
            matter.lead = lead;
          }
          return this.matterService.saveMatter(matter);
        }),
      );
    } else {
      saveMatter$ = this.matterService.saveMatter(matter);
    }
    saveMatter$.pipe(
      first(),
      catchValidationError(({ validationData }) => {
        if (validationData == null) {
          return throwError(new Error('Unexpected error on matter creation'));
        }
        this.presentValidationErrorMessage();
        this.validationError$.next(validationData);
        this.isLoading$.next(false);
        return EMPTY;
      }),
      switchMap(createdMatter => this.finishMatterSaving(createdMatter)),
      catchError(error => {
        this.isLoading$.next(false);
        return throwError(error);
      }),
    ).subscribe();
  }

  /** Present a dialog with an error message. */
  protected presentValidationErrorMessage(): Promise<void> {
    return this.dialogService.showInformationDialog(
      VALIDATION_ERROR_DIALOG_INFO,
    );
  }

  /** Present success message. */
  protected presentSuccessMessage(): Promise<void> {
    return this.dialogService.showSuccessDialog(
      SUCCESS_DIALOG_INFO,
    );
  }

  private finishMatterSaving(matter: Matter): Observable<void> {
    /**
     * Redirect user to DocuSign if envelop has "created" status.
     * Otherwise just return to matters page.
     */
    const redirectUrl = this.urlsService.getApplicationStateUrl('/matters');
    return this.eSignService.getESignEnvelop(matter.eSignEnvelop.id, redirectUrl)
      .pipe(
        switchMap(matterEnvelop => {
          this.isLoading$.next(false);
          if (matterEnvelop.status === 'created') {
            const eSignEditLink = matterEnvelop.editLink;
            return this.presentSuccessMessage()
              .then(() => this.goToMattersPage())
              .then(() => this.externalResourcesService.openExternalLink(eSignEditLink));
          }
          return this.goToMattersPage();
        }),
        mapTo(null),
      );
  }

  /** Navigate to matters page. */
  protected goToMattersPage(): Promise<boolean> {
    return this.router.navigateByUrl('/matters');
  }

  /**
   * Map form values to matter model.
   * @param form Form control.
   */
  private formValuesToMatter(form: FormGroup): Matter {
    const cityValue = form.controls.city.value;

    return new Matter({
      id: this.matterId,
      code: form.controls.code.value,
      city: typeof cityValue === 'string' ? { name: cityValue } : cityValue,
      client: form.controls.client.value,
      title: form.controls.title.value,
      description: form.controls.description.value,
      rateType: form.controls.rateType.value,
      rate: form.controls.rate.value,
      state: form.controls.state.value,
      country: form.controls.country.value,
      documents: form.controls.documents.value,
    });
  }

  /**
   * Create an observable of FormGroup instance.
   * @description Creates an empty form if current mode is "creation" or retrieves matter by ID and preset form values.
   * @param countries$ Countries stream to set init value of country.
   */
  private createFormStream(countries$: Observable<Country[]>, clients$: Observable<Client[]>): Observable<FormGroup> {
    return combineLatest([
      countries$,
      clients$,
    ])
      .pipe(
        switchMap(([countries, clients]) => {
          const countryValue = countries.length > 0
            ? countries[0]
            : null;
          const client = this.clientId ? clients.find(({ id }) => id === this.clientId) : null;

          const form = this.formBuilder.group({
            client: [client, [Validators.required]],
            code: [null, [Validators.required]],
            title: [null, [Validators.required]],
            description: [null, [Validators.required]],
            rateType: [null, [Validators.required, Validators.min(0)]],
            rate: [null, [Validators.required]],
            state: [null, [Validators.required]],
            city: [null],
            country: [countryValue],
            documents: [null, Validators.required],
          });
          form.controls.country.disable();
          // If this creation of a new matter then just return a the form.
          if (this.matterId == null) {
            return of(form);
          }
          // Otherwise request matter data and update form values.
          return this.matterService.getMatterById(this.matterId)
            .pipe(
              first(),
              tap((matter) => {
                if (DISABLE_CLIENT_STATUSES.includes(matter.status)) {
                  form.controls.client.disable();
                }
              }),
              map(matter => {
                form.setValue({
                  client: matter.client,
                  code: matter.code,
                  title: matter.title,
                  description: matter.description,
                  rateType: matter.rateType,
                  rate: matter.rate,
                  state: matter.state,
                  city: matter.city,
                  country: matter.country,
                  documents: matter.documents,
                });

                return form;
              }),
            );
        }),
        shareReplay({
          bufferSize: 1,
          refCount: true,
        }),
      );
  }

  private createCitiesForAutocompleteStream(form$: Observable<FormGroup>): Observable<City[]> {
    return form$
      .pipe(
        switchMap(form => form.controls.city.valueChanges),
        switchMap(cityQuery => {
          if (cityQuery && typeof cityQuery === 'string') {
            return this.citiesService.getCities(cityQuery).pipe(first());
          }
          return of([]);
        }),
      );
  }

  private createCountriesStream(): Observable<Country[]> {
    return this.countriesService.getCountries()
      .pipe(
        shareReplay({
          bufferSize: 1,
          refCount: true,
        }),
      );
  }

  /** Function for displaying city name on autocomplete */
  public displayCity(city: City): string {
    return city ? city.name : undefined;
  }

  /**
   * Track document by name.
   * @param document Matter document.
   */
  public trackDocumentByName(_: number, document: JusLawFile): string {
    return document.name;
  }

}

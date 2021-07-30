import { Component, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
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
import {
  EditMatterPageComponent as TabletEditMatterPageComponent,
} from '@jl/common/desktop/modules/matters/pages/edit-matter-page/edit-matter-page.component';
import { DialogsService } from '@jl/common/shared';

import { MobileFileDropComponent } from '../../../components/mobile-file-drop/mobile-file-drop.component';
import { AlertService } from '../../../services/alert.service';

const SUCCESS_DIALOG_INFO = {
  title: 'Agreement Document Sent',
  message: 'A new matter has been created and to continue you will be redirected to DocuSign profile to complete process.',
};

const VALIDATION_ERROR_DIALOG_INFO = {
  title: 'Error saving matter',
  message: 'Form completed erroneously.',
};

/**
 * Create matter page for mobile workspace.
 */
@Component({
  selector: 'jlc-edit-matter-page',
  templateUrl: './edit-matter-page.component.html',
  styleUrls: ['./edit-matter-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditMatterPageComponent extends TabletEditMatterPageComponent {
  /** Uploader. */
  @ViewChild(MobileFileDropComponent, { static: false })
  public uploader: MobileFileDropComponent;

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
   * @param alertService Alert service.
   * @param navController Nav controller.
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
    private readonly alertService: AlertService,
    private readonly navController: NavController,
  ) {
    super(formBuilder,
      matterService,
      rateTypeService,
      statesService,
      countriesService,
      usersService,
      citiesService,
      dialogService,
      router,
      activatedRoute,
      eSignService,
      externalResourcesService,
      urlsService,
      leadsService);
  }

  /**
   * Choose files.
   */
  public chooseFiles(): void {
    this.uploader.clickOnInput();
  }

  /**
   * On errors change.
   * @param errors Errors.
   */
  public async onErrorChange(errors: string[]): Promise<void> {
    this.alertService.showNotificationAlert({
      header: 'Some files weren\'t attached',
      message: errors.join('\n'),
    });
  }

  /** Present a dialog with an error message. */
  protected presentValidationErrorMessage(): Promise<void> {
    return this.alertService.showNotificationAlert(
      VALIDATION_ERROR_DIALOG_INFO,
    );
  }

  /** Present success message. */
  protected presentSuccessMessage(): Promise<void> {
    return this.alertService.showNotificationAlert(
      SUCCESS_DIALOG_INFO,
    );
  }

  /** @inheritdoc */
  public goToMattersPage(): Promise<boolean> {
    // To clear navigation stack.
    return this.navController.navigateRoot('/matters');
  }
}

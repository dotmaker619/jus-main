import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Attorney } from '@jl/common/core/models/attorney';
import { EventsService } from '@jl/common/core/services/attorney/events.service';
import { AttorneysService } from '@jl/common/core/services/attorneys.service';
import { AuthService } from '@jl/common/core/services/auth.service';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { UsersService } from '@jl/common/core/services/users.service';
import { PointsOnMapModalComponent } from '@jl/common/mobile/modals/points-on-map-modal/points-on-map-modal.component';
import { AlertService } from '@jl/common/mobile/services/alert.service';
import { DialogsService } from '@jl/common/shared';
import { BaseAttorneyProfilePage, DialogInfo } from '@jl/common/shared/base-components/attorneys/attorney-profile-page.base';
import { Observable, from, NEVER } from 'rxjs';
import { map, first, switchMap, filter } from 'rxjs/operators';

interface InfoSectionElement {
  /** Section element label. */
  label: string;
  /** Section element text. */
  text: string;
}

interface GeneratedInfoSection {
  /** Info */
  title: string;
  /** Section rows. */
  elements: InfoSectionElement[];
}

function buildGeneratedSectionsFromAttorney(this: void, attorney: Attorney): GeneratedInfoSection[] {
  return [
    {
      title: 'Education',
      elements: [
        {
          label: 'Law School',
          text: attorney.education.university,
        },
        {
          label: 'Year of Graduation',
          text: attorney.education.year.toString(),
        },
      ],
    },
    {
      title: 'Practice',
      elements: [
        {
          label: `Federal jurisdictions ${attorney.firstName} is licensed or authorized to practice in`,
          text: attorney.practiceJurisdictions.map(pj => pj.name).join(', '),
        },
        {
          label: 'Legal practice',
          text: attorney.practiceDescription,
        },
      ],
    },
    {
      title: 'Specialty',
      elements: [
        {
          label: 'Area(s) of Specialty',
          text: attorney.specialties.map(s => s.title).join(', '),
        },
        {
          label: 'Number of years practice in the specialized area',
          text: attorney.specialtyTime.toString(),
        },
        {
          label: 'Number of handled matters in 5 years',
          text: attorney.specialtyMattersCount.toString(),
        },
      ],
    },
  ];
}

/** Attorney profile page. For mobile devices only. */
@Component({
  selector: 'jlc-attorney-profile-page',
  templateUrl: './attorney-profile-page.component.html',
  styleUrls: ['./attorney-profile-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttorneyProfilePageComponent extends BaseAttorneyProfilePage {

  /** Generated info. */
  public readonly generatedInfo$: Observable<GeneratedInfoSection[]>;
  /**
   * @constructor
   * @param activatedRoute Activated route.
   * @param userService User service.
   * @param usersService Users service.
   * @param dialogsService Dialogs service.
   * @param eventsService Events service.
   * @param authService Auth service.
   * @param router Router.
   * @param alertService Alert service.
   * @param modalController Modal controller.
   * @param attorneysService Attorneys service.
   */
  public constructor(
    activatedRoute: ActivatedRoute,
    userService: CurrentUserService,
    usersService: UsersService,
    dialogsService: DialogsService,
    eventsService: EventsService,
    authService: AuthService,
    router: Router,
    attorneysService: AttorneysService,
    private readonly alertService: AlertService,
    private readonly modalController: ModalController,
  ) {
    super(
      activatedRoute,
      userService,
      usersService,
      attorneysService,
      dialogsService,
      eventsService,
      authService,
      router,
    );
    this.generatedInfo$ = this.initGeneratedInfoStream();
  }

  private initGeneratedInfoStream(): Observable<GeneratedInfoSection[]> {
    return this.attorney$.pipe(
      map(buildGeneratedSectionsFromAttorney),
    );
  }

  /** Handle click on more button. */
  public onShowMapClick(): void {
    this.attorney$.pipe(
      first(),
      switchMap((attorney) =>
        this.modalController.create({
          component: PointsOnMapModalComponent,
          componentProps: {
            coordinates: attorney.firmLocation,
            title: `${attorney.firstName}'s location`,
          },
        }),
      ),
      switchMap(modal => modal.present()),
    ).subscribe();
  }

  /** Handle click on verification badge. */
  public onVerificationBadgeClick(): void {
    this.alertService.showNotificationAlert({
      header: 'Attorney is Verified',
    });
  }

  /** @inheritdoc */
  protected showFailedFollowingDialog(dialogInfo: DialogInfo): Promise<void> {
    return this.alertService.showNotificationAlert({
      header: dialogInfo.title,
      message: dialogInfo.message,
    });
  }

  /** @inheritdoc */
  protected showSuccessfulFollowingDialog(dialogInfo: DialogInfo): Promise<void> {
    return this.alertService.showNotificationAlert({
      header: dialogInfo.title,
      message: dialogInfo.message,
    });
  }

  /** Show login required dialog. */
  protected showLoginRequiredDialog(): Observable<never> {
    return from(this.alertService.showConfirmation(
      {
        message: this.loginRequiredMessage,
        header: 'Login Required',
        buttonText: 'Login',
        cancelButtonText: 'Not yet',
      },
    )).pipe(
      filter(shouldRedirect => shouldRedirect),
      switchMap(() =>
        this.router.navigateByUrl('/auth') && NEVER,
      ),
    );
  }
}

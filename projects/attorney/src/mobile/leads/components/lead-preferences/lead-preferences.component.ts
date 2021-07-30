import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Attorney } from '@jl/common/core/models/attorney';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { Observable } from 'rxjs';
import { shareReplay, map } from 'rxjs/operators';

/**
 * Lead preferences component. Shows user's settings according to which list of opportunities is displayed.
 */
@Component({
  selector: 'jlat-lead-preferences',
  templateUrl: './lead-preferences.component.html',
  styleUrls: ['./lead-preferences.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeadPreferencesComponent {

  /** Current attorney. */
  public readonly attorney$: Observable<Attorney>;

  /** Attorney's location. */
  public readonly location$: Observable<string[]>;

  /** Attorney's specialties. */
  public readonly specialties$: Observable<string[]>;

  /** Keywords. */
  public readonly keywords$: Observable<string[]>;

  /**
   * @constructor
   *
   * @param userService User service.
   * @param modalController Modal controller.
   * @param router Router.
   */
  public constructor(
    private readonly userService: CurrentUserService,
    private readonly modalController: ModalController,
    private readonly router: Router,
  ) {
    this.attorney$ = this.userService.getCurrentAttorney().pipe(
      shareReplay({ bufferSize: 1, refCount: true }),
    );

    this.location$ = this.attorney$.pipe(
      map(attorney => {
        if (attorney.practiceJurisdictions) {
          return attorney.practiceJurisdictions.map(state => state.name);
        }
      }),
    );

    this.specialties$ = this.attorney$.pipe(
      map(attorney => {
        if (attorney.specialties) {
          return attorney.specialties.map(specialty => specialty.title);
        }
      }),
    );

    this.keywords$ = this.attorney$.pipe(map(attorney => attorney.keywords ? attorney.keywords.split(', ') : null));
  }

  /** Close the modal. */
  public onCloseClick(): void {
    this.modalController.dismiss();
  }

  /** Handle click on edit button. */
  public onEditClick(): void {
    this.modalController.dismiss();
    this.router.navigate(['/profile', 'edit']);
  }
}

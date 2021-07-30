import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalController, ActionSheetController } from '@ionic/angular';
import { SelectOption } from '@jl/common/core/models';
import { AttorneyEvent } from '@jl/common/core/models/attorney-event';
import { EventsService } from '@jl/common/core/services/attorney/events.service';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { Observable, ReplaySubject, combineLatest, of, from } from 'rxjs';
import { switchMap, shareReplay, startWith, first } from 'rxjs/operators';

import { EditEventModalComponent } from '../component/edit-event-modal/edit-event-modal.component';

/** Filter options. */
enum filterOption {
  /** Upcoming events. */
  Upcoming = 'upcoming',
  /** All events. */
  All = 'all',
}

/**
 * Events page for mobile workspace.
 */
@Component({
  selector: 'jlat-events-page',
  templateUrl: './events-page.component.html',
  styleUrls: ['./events-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventsPageComponent {
  /**
   * Events.
   */
  public readonly events$: Observable<AttorneyEvent[]>;
  /**
   * Form group.
   */
  public readonly form$: Observable<FormGroup>;

  /** Filtering options. */
  public readonly filterOptions: SelectOption[] = [
    { label: 'Upcoming', value: filterOption.Upcoming },
    { label: 'All', value: filterOption.All },
  ];

  /** Current filter. */
  public readonly filter$ = new Observable<SelectOption>();

  private readonly update$ = new ReplaySubject<void>(1);

  /**
   * @constructor
   *
   * @param fb Form builder
   * @param modalCtrl Modal controller.
   * @param userService User service.
   * @param eventsService Events service.
   * @param actionSheetCtrl Actionsheet controller.
   */
  public constructor(
    private readonly fb: FormBuilder,
    private readonly modalCtrl: ModalController,
    private readonly userService: CurrentUserService,
    private readonly eventsService: EventsService,
    private readonly actionSheetCtrl: ActionSheetController,
  ) {
    this.form$ = this.initFormStream();
    this.filter$ = this.initFilterStream();
    this.events$ = this.initEventsStream();
  }

  /**
   * Handle 'click' event of 'Add event' button.
   */
  public onAddEventClick(): void {
    this.openCreateEventModal();
  }

  /**
   * Handle 'change' event of 'jlat-event-card-component'
   */
  public async onEventOptionsClicked(event: AttorneyEvent): Promise<void> {
    const actionSheet = await this.actionSheetCtrl.create({
      buttons: [
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => this.deleteEvent(event),
        },
        {
          text: 'Edit',
          handler: () => this.openEditModal(event),
        },
        {
          text: 'Cancel',
          role: 'cancel',
        },
      ],
    });
    await actionSheet.present();
  }

  private openEditModal(event: AttorneyEvent): void {
    const modal$ = from(this.modalCtrl.create({
      component: EditEventModalComponent,
      componentProps: { event },
    }));
    modal$
      .pipe(first(), switchMap((modal) => modal.present() && modal.onDidDismiss()))
      .subscribe(() => this.update$.next());
  }

  private deleteEvent(event: AttorneyEvent): void {
    this.eventsService.deleteEvent(event.id)
      .pipe(first())
      .subscribe(() => this.update$.next());
  }

  /**
   * TrackBy function for an event list.
   *
   * @param _ Idx.
   * @param event Event.
   */
  public trackEvent(_: number, event: AttorneyEvent): number {
    return event.id;
  }

  private initEventsStream(): Observable<AttorneyEvent[]> {
    const searchParams$ = combineLatest([
      this.userService.currentUser$,
      this.filter$,
      this.update$.pipe(startWith(null)),
    ]);

    return searchParams$
      .pipe(
        switchMap(([user, filter]) => {
          const upcoming = filter.value === filterOption.Upcoming;
          return this.eventsService.getEvents({
            ordering: 'start',
            attorney: user.id,
            upcoming,
          });
        }),
        shareReplay({
          refCount: true,
          bufferSize: 1,
        }),
      );
  }

  private initFormStream(): Observable<FormGroup> {
    const form = this.fb.group({
      filter: [this.filterOptions[0], [Validators.required]],
    });

    return of(form).pipe(
      shareReplay({
        refCount: true,
        bufferSize: 1,
      }),
    );
  }

  private initFilterStream(): Observable<SelectOption> {
    return this.form$
      .pipe(
        switchMap((form) => form.controls.filter.valueChanges),
        startWith(this.filterOptions[0]),
        shareReplay({
          refCount: true,
          bufferSize: 1,
        }),
      );
  }

  private async openCreateEventModal(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: EditEventModalComponent,
    });
    modal.present();
    await modal.onDidDismiss();
    this.update$.next();
  }
}

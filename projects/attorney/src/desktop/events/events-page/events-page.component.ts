import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { SelectOption } from '@jl/common/core/models';
import { AttorneyEvent } from '@jl/common/core/models/attorney-event';
import { EventsService } from '@jl/common/core/services/attorney/events.service';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { trackById } from '@jl/common/core/utils/trackby-id';
import { DialogsService } from '@jl/common/shared';
import { ConfirmationDialogOptions } from '@jl/common/shared/modules/dialogs/confirmation-dialog/confirmation-dialog.component';
import { Observable, BehaviorSubject, combineLatest, EMPTY } from 'rxjs';
import { shareReplay, switchMap, catchError, startWith, finalize, first } from 'rxjs/operators';

const DELETE_DIALOG_OPTIONS: Partial<ConfirmationDialogOptions> = {
  title: 'Delete Event',
  message: 'Are you sure you want to delete this?',
  confirmationButtonText: 'Delete',
  confirmationButtonClass: 'tertiary',
};

const FAIL_DELETE_DIALOG_OPTIONS = {
  title: 'Fail',
  message: 'Failed to delete event.',
};

/** Filter options. */
enum filterOption {
  /** Upcoming events. */
  Upcoming = 'upcoming',
  /** All events. */
  All = 'all',
}

/** Events page component. */
@Component({
  selector: 'jlat-events-page',
  templateUrl: './events-page.component.html',
  styleUrls: ['./events-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventsPageComponent {

  /** Filtering options. */
  public readonly filterOptions: SelectOption[] = [
    { label: 'Upcoming', value: filterOption.Upcoming },
    { label: 'All', value: filterOption.All },
  ];

  /** Current filter. */
  public filter$ = new BehaviorSubject<string>(this.filterOptions[0].value.toString());

  /** Events subject. */
  public events$: Observable<AttorneyEvent[]> = combineLatest([this.userService.currentUser$.pipe(first()), this.filter$]).pipe(
    switchMap(([user, filter]) => {
      const upcoming = filter === filterOption.Upcoming;
      return this.eventsService.getEvents({
        attorney: user.id,
        upcoming,
      }).pipe(
        startWith(null),
        shareReplay({
          bufferSize: 1,
          refCount: true,
        }),
      );
    }),
  );

  /** Turn on/off loader. */
  public isLoading$ = new BehaviorSubject<boolean>(false);

  /** Track by function. */
  public trackById = trackById;

  /**
   * @constructor
   * @param userService
   * @param eventsService
   * @param dialogsService
   * @param router
   */
  constructor(
    private userService: CurrentUserService,
    private eventsService: EventsService,
    private dialogsService: DialogsService,
    private router: Router,
  ) { }

  /**
   * trackSelectOptions
   * @param value
   */
  public trackSelectOptions(_: number, { value }: SelectOption): string | number {
    return value;
  }

  /**
   * Change filter.
   * @param value Selected value
   */
  public onFilterChange(changeEvent: Event): void {
    const eventTarget = changeEvent.target as HTMLSelectElement;
    eventTarget.blur(); // Prevent opening select on iOS
    this.filter$.next(eventTarget.value);
  }

  /** Open confirm deleting dialog. */
  public onDeleteClicked(event: AttorneyEvent): void {
    this.dialogsService.showConfirmationDialog(DELETE_DIALOG_OPTIONS).then((confirmed: boolean) => {
      if (confirmed) {
        this.isLoading$.next(true);
        this.eventsService.deleteEvent(event.id).pipe(
          catchError(() => {
            this.dialogsService.showInformationDialog(FAIL_DELETE_DIALOG_OPTIONS);
            return EMPTY;
          }),
          finalize(() => this.isLoading$.next(false)),
        ).subscribe(() => {
          // Update event list
          this.filter$.next(this.filter$.value);
        });
      }
    });
  }

  /** Navigate to edit page. */
  public onEditClicked(event: AttorneyEvent): void {
    this.router.navigate(['/events/edit', event.id]);
  }
}

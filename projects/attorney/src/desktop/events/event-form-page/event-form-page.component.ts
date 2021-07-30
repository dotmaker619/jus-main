import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Link } from '@jl/common/core/models';
import { TEntityValidationErrors } from '@jl/common/core/models/api-error';
import { AttorneyEvent } from '@jl/common/core/models/attorney-event';
import { DateTimePickerOptions } from '@jl/common/core/models/date-time-picker-options';
import { catchValidationError } from '@jl/common/core/rxjs';
import { EventsService } from '@jl/common/core/services/attorney/events.service';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { JusLawValidators } from '@jl/common/core/validators/validators';
import { DialogsService } from '@jl/common/shared';
import { Subject, EMPTY, BehaviorSubject, Observable, of, combineLatest, NEVER, throwError } from 'rxjs';
import { catchError, switchMap, finalize, first, distinctUntilChanged, startWith, map, shareReplay } from 'rxjs/operators';

import { DateTimePickerMode } from '../../../../../common/src/lib/shared/components/date-time-picker/date-time-picker.component';

const EVENT_SAVED_TITLE = 'Event saved!';
const EVENT_SAVED_MESSAGE = 'Event successfully saved. You will be returned to the event list.';

const MAX_HOURS = 23;
const MAX_MINUTES = 59;
const MAX_SECONDS = 59;

/**
 * Return date with time end of a day.
 * @param startDate Date of start event.
 */
function setTimeToEndOfDay(startDate: Date): Date {
  return new Date(new Date(startDate).setHours(MAX_HOURS, MAX_MINUTES, MAX_SECONDS));
}

/** Event form component. */
@Component({
  selector: 'jlat-event-form-page',
  templateUrl: './event-form-page.component.html',
  styleUrls: ['./event-form-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventFormPageComponent {
  private readonly eventId: number | null;
  /** Validation error subject. */
  public readonly validationError$ = new Subject<TEntityValidationErrors<AttorneyEvent>>();

  /** Breadcrumb links. */
  public readonly breadcrumbs: Link[];

  /** Event form. */
  public readonly eventForm$: Observable<FormGroup>;

  /** Date picker options. */
  public readonly datePickerOptions: DateTimePickerOptions = {
    displayFormat: 'MM DD YYYY',
    placeholder: 'MM DD YYYY',
  };

  /** Time picker options. */
  public readonly timePickerOptions: DateTimePickerOptions = {
    displayFormat: 'h:mm A',
    placeholder: 'h:mm A',
  };

  /** Time pickers disabled state subject. */
  public readonly isAllDayMode$: Observable<boolean>;

  /**
   * Date time picker mode.
   */
  public readonly dateTimPickerMode$: Observable<DateTimePickerMode>;

  /** Form mode. */
  public readonly formTitle: 'New' | 'Edit';

  /** Loading state. */
  public readonly isLoading$ = new BehaviorSubject<boolean>(false);

  /**
   * @constructor
   * @param formBuilder Form builder.
   * @param eventsService Events service.
   * @param userService User service.
   * @param activatedRoute Activated route.
   * @param router Router.
   * @param dialogsService Dialogs service.
   */
  public constructor(
    private formBuilder: FormBuilder,
    private eventsService: EventsService,
    private userService: CurrentUserService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private dialogsService: DialogsService,
  ) {
    this.eventId = this.activatedRoute.snapshot.paramMap.has('id')
      ? parseInt(this.activatedRoute.snapshot.paramMap.get('id'), 10)
      : null;
    this.formTitle = this.activatedRoute.snapshot.paramMap.has('id')
      ? 'Edit'
      : 'New';
    this.breadcrumbs = [
      { label: 'Event Management', link: '/events' },
      { label: this.formTitle, link: '.' },
    ];
    this.eventForm$ = this.createEventFormStream();
    this.isAllDayMode$ = this.eventForm$
      .pipe(
        switchMap(form => {
          const isAllDayControl = form.get('isAllDay');
          return (isAllDayControl.valueChanges as Observable<boolean>)
            .pipe(
              startWith(isAllDayControl.value as boolean),
            );
        }),
        distinctUntilChanged(),
        shareReplay({
          refCount: true,
          bufferSize: 1,
        }),
      );

    this.dateTimPickerMode$ = this.isAllDayMode$
      .pipe(
        map(isAllDay => {
          const mode: DateTimePickerMode = isAllDay
            ? 'date'
            : 'datetime';
          return mode;
        }),
      );

  }

  private createEventFormStream(): Observable<FormGroup> {
    const initForm = this.formBuilder.group({
      title: [null, [Validators.required]],
      dateTimeRange: this.formBuilder.group({
        start: [null, [Validators.required]],
        end: [null, [Validators.required]],
      }, { validator: JusLawValidators.dateRange('start', 'end') }),
      isAllDay: false,
      location: null,
      locationTimezone: null,
      description: null,
    });
    const form$ = this.eventId == null
      ? of(initForm)
      : this.updateFormFromEvent(this.eventId, initForm);

    return form$
      .pipe(
        switchMap(form => {
          // React on controls changes to adjust values and enable/disable.
          const isAllDayControl = form.get('isAllDay');
          const startDateControl = form.get(['dateTimeRange', 'start']);
          const endDateControl = form.get(['dateTimeRange', 'end']);
          const isAllDayChange$ = (isAllDayControl.valueChanges as Observable<boolean>)
            .pipe(
              distinctUntilChanged(),
              startWith(isAllDayControl.value as boolean),
            );
          const startDateChange$ = (startDateControl.valueChanges as Observable<Date>)
            .pipe(
              distinctUntilChanged(),
              startWith(startDateControl.value as Date),
            );

          return combineLatest(isAllDayChange$, startDateChange$)
            .pipe(
              switchMap(([isAllDay, startDate]) => {
                if (isAllDay) {
                  // For all day mode we need only one date.
                  endDateControl.setValue(null);
                  endDateControl.disable();
                } else {
                  endDateControl.enable();
                }
                return NEVER; // Stop emission since the form is reactive itself.
              }),
              startWith(form),
            );
        }),
        shareReplay({
          refCount: true,
          bufferSize: 1,
        }),
      );
  }

  private updateFormFromEvent(eventId: number, form: FormGroup): Observable<FormGroup> {
    return this.eventsService.getEvent(eventId)
      .pipe(
        first(),
        catchError(() => {
          this.router.navigate(['events']);
          return EMPTY;
        }),
        map(event => {
          form.patchValue({
            title: event.title,
            dateTimeRange: {
              start: event.start,
              end: event.end,
            },
            isAllDay: event.isAllDay,
            location: event.location.name,
            locationTimezone: event.location.timezone,
            description: event.description,
          });
          return form;
        }),
      );
  }

  /**
   * Set end date depend on start date.
   * @param endControl
   * @param start
   */
  private setEndDate(endControl: AbstractControl, start: Date): void {
    const endDate = new Date(start);
    endDate.setHours(MAX_HOURS);
    endDate.setMinutes(MAX_MINUTES);
    endDate.setSeconds(MAX_SECONDS);
    endControl.setValue(endDate);
  }

  /** Save event. */
  public eventFormSubmitted(form: FormGroup): void {
    form.markAllAsTouched();
    if (!form.valid) {
      return;
    }
    const start = form.value.dateTimeRange.start;
    const end = form.value.dateTimeRange.end || setTimeToEndOfDay(start);

    const event = new AttorneyEvent({
      id: this.eventId,
      title: form.value.title,
      start,
      end,
      isAllDay: form.value.isAllDay,
      location: {
        timezone: form.value.locationTimezone,
        name: form.value.location,
      },
      description: form.value.description,
    });

    this.isLoading$.next(true);

    this.userService.currentUser$
      .pipe(
        first(),
        switchMap(currentUser => {
          event.attorneyId = currentUser.id;
          return this.eventsService.saveEvent(event);
        }),
        catchValidationError((error) => {
          this.validationError$.next(error.validationData);
          return EMPTY;
        }),
        switchMap(() => {
          this.isLoading$.next(false);
          return this.dialogsService.showSuccessDialog({
            title: EVENT_SAVED_TITLE,
            message: EVENT_SAVED_MESSAGE,
          });
        }),
        catchError(error => {
          this.isLoading$.next(false);
          return throwError(error);
        }),
        finalize(() => this.isLoading$.next(false)),
      )
      .subscribe(() => this.router.navigate(['events']));
  }
}

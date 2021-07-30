import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { TEntityValidationErrors } from '@jl/common/core/models/api-error';
import { AttorneyEvent } from '@jl/common/core/models/attorney-event';
import { DateTimePickerOptions } from '@jl/common/core/models/date-time-picker-options';
import { catchValidationError } from '@jl/common/core/rxjs';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { EventsService } from '@jl/common/core/services/attorney/events.service';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { JusLawDateUtils } from '@jl/common/core/utils/date-utils';
import { JusLawValidators } from '@jl/common/core/validators/validators';
import { DateTimePickerMode } from '@jl/common/shared/components/date-time-picker/date-time-picker.component';
import { Observable, of, ReplaySubject, NEVER, merge, EMPTY, Subject, BehaviorSubject } from 'rxjs';
import { tap, switchMapTo, first, switchMap, startWith, distinctUntilChanged, shareReplay, map, filter } from 'rxjs/operators';

/**
 * Modal to create or edit modal.
 */
@Component({
  selector: 'jlat-edit-event-modal',
  templateUrl: './edit-event-modal.component.html',
  styleUrls: ['./edit-event-modal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditEventModalComponent implements OnInit {
  /**
   * Attorney event.
   */
  @Input()
  public event?: AttorneyEvent;
  /**
   * Form group.
   */
  public readonly form$: Observable<FormGroup>;
  /**
   * Validation error subject.
   */
  public validationError$ = new Subject<TEntityValidationErrors<AttorneyEvent>>();
  /**
   * Time pickers disabled state subject.
   */
  public readonly isAllDayMode$: Observable<boolean>;
  /**
   * Date time picker mode.
   */
  public readonly dateTimePickerMode$: Observable<DateTimePickerMode>;
  /**
   * Loading controller.
   */
  public isLoading$ = new BehaviorSubject<boolean>(false);
  /**
   * Date picker options.
   */
  public readonly datePickerOptions: DateTimePickerOptions = {
    displayFormat: 'MM/DD/YY',
    placeholder: 'MM/DD/YY',
  };
  /**
   * Time picker options.
   */
  public readonly timePickerOptions: DateTimePickerOptions = {
    displayFormat: 'h:mm A',
    placeholder: 'h:mm',
  };
  /**
   * Header title.
   */
  public get headerTitle(): string {
    return this.event ? 'Edit Event' : 'New Event';
  }

  private readonly init$ = new ReplaySubject(1);

  /**
   * @constructor
   *
   * @param fb Form builder.
   * @param modalCtrl Modal controller.
   * @param userService User service.
   * @param eventsService Events Service.
   */
  public constructor(
    private readonly fb: FormBuilder,
    private readonly modalCtrl: ModalController,
    private readonly userService: CurrentUserService,
    private readonly eventsService: EventsService,
  ) {
    this.form$ = this.initFormStream();
    this.isAllDayMode$ = this.initAllDayCheckStream();
    this.dateTimePickerMode$ = this.initDateTimePickerModeStream();
  }

  /** @inheritdoc */
  public ngOnInit(): void {
    this.init$.next();
  }

  /**
   * Handle 'submit' event of form.
   *
   * @param form Form group.
   */
  public onFormSubmit(form: FormGroup): void {
    form.markAllAsTouched();
    if (form.invalid || this.isLoading$.value) {
      return;
    }
    const start = form.value.dateTimeRange.start;
    const end = form.value.dateTimeRange.end || JusLawDateUtils.getEndOfDay(start);

    const event = new AttorneyEvent({
      id: this.event ? this.event.id : undefined,
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
          this.isLoading$.next(false);
          return EMPTY;
        }),
        onMessageOrFailed(() => this.isLoading$.next(false)),
      )
      .subscribe(() => this.close());
  }

  /**
   * Handle 'click' event of 'Cancel' button.
   */
  public onCancelClick(): void {
    this.close();
  }

  private initFormStream(): Observable<FormGroup> {
    const form = this.fb.group({
      title: [null, [Validators.required]],
      dateTimeRange: this.fb.group({
        start: [null, [Validators.required]],
        end: [null, [Validators.required, JusLawValidators.minDate(new Date())]],
      }, { validator: JusLawValidators.dateRange('start', 'end') }),
      isAllDay: false,
      location: null,
      locationTimezone: null,
      description: null,
    });

    const disableDateEndControl$ = form.controls.isAllDay.valueChanges
      .pipe(
        tap((isAllDay: boolean) => {
          const endDateControl = form.get(['dateTimeRange', 'end']);
          if (isAllDay) {
            endDateControl.setValue(null);
            endDateControl.disable();
          } else {
            endDateControl.enable();
          }
        }),
        switchMapTo(NEVER),
      );

    const formFill$ = this.init$
      .pipe(
        filter(() => !!this.event),
        tap(() => {
          form.patchValue({
            title: this.event.title,
            dateTimeRange: {
              start: this.event.start,
              end: this.event.end,
            },
            isAllDay: this.event.isAllDay,
            location: this.event.location.name,
            locationTimezone: this.event.location.timezone,
            description: this.event.description,
          });
        }),
        switchMapTo(NEVER),
      );

    return merge(of(form), formFill$, disableDateEndControl$);
  }

  private initAllDayCheckStream(): Observable<boolean> {
    return this.form$
      .pipe(
        switchMap(form => form.controls.isAllDay.valueChanges as Observable<boolean>),
        startWith(false),
        distinctUntilChanged(),
        shareReplay({
          refCount: true,
          bufferSize: 1,
        }),
      );
  }

  private initDateTimePickerModeStream(): Observable<DateTimePickerMode> {
    return this.isAllDayMode$.pipe(map(isAllDay => isAllDay ? 'date' : 'datetime'));
  }

  private close(): void {
    this.modalCtrl.dismiss();
  }
}

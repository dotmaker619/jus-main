import { Component, ChangeDetectionStrategy, Input, Optional, OnChanges, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, FormGroup, FormControl, NgControl } from '@angular/forms';
import { DateTimePickerOptions } from '@jl/common/core/models/date-time-picker-options';
import { DateTime } from 'luxon';

/**
 * Date time picker modes.
 */
export type DateTimePickerMode = 'datetime' | 'date';

/** Date-time picker field component. */
@Component({
  selector: 'jlc-date-time-picker',
  templateUrl: './date-time-picker.component.html',
  styleUrls: ['./date-time-picker.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateTimePickerComponent implements ControlValueAccessor, OnChanges {
  private modeValue: DateTimePickerMode = 'datetime';

  /** Date display format. */
  @Input()
  public dateDisplayFormat: string;

  /** Time display format. */
  @Input()
  public timeDisplayFormat: string;

  /** Date picker options. */
  @Input()
  public datePickerOptions: DateTimePickerOptions;

  /** Time picker options. */
  @Input()
  public timePickerOptions: DateTimePickerOptions;

  /**
   * Timezone of date time.
   */
  @Input()
  public timezone?: string;

  /**
   * "Only date mode" value.
   * To allow working only with date.
   */
  public get mode(): DateTimePickerMode {
    return this.modeValue;
  }

  /**
   * "Only date mode" value.
   * To allow working only with date.
   */
  @Input()
  public set mode(value: DateTimePickerMode) {
    this.modeValue = value;
    if (value === 'date') {
      // Disable time-picker
      this.dateTimeForm.controls.time.disable();
      return;
    }
    // If changed to "enable" then enable the control.
    this.dateTimeForm.controls.time.enable();
    if (this.dateTimeForm.controls.time.value == null) {
      /**
       * If value was changed by user and for now time is null,
       * then set whole date value to null since if we don't know the time the we don't have a value at all.
       * Change only value but not display value.
       */
      this.ngControl.control.setValue(null);
    }
  }

  private onChange: Function;

  private onTouched: Function;

  private value: Date;

  /**
   * Date-time form control.
   */
  public dateTimeForm = new FormGroup({
    date: new FormControl(),
    time: new FormControl(),
  });

  /**
   * @constructor
   * @param ngControl NgControl instance.
   */
  public constructor(
    @Optional()
    public ngControl: NgControl,
  ) {
    // Replace the provider with this.
    if (this.ngControl != null) {
      // Setting the value accessor directly (instead of using the providers) to avoid running into a circular import.
      this.ngControl.valueAccessor = this;
    }
  }

  /**
   * @inheritdoc
   */
  public ngOnChanges(changes: SimpleChanges): void {
    if ('timezone' in changes) {
      // Call value update to display value in target timezone.
      this.ngControl.valueAccessor.writeValue(this.value);
    }
  }

  /** Set date value. */
  public onDateChanged(event: CustomEvent): void {
    if (!this.value) {
      this.value = new Date();
    }
    const date = new Date(event.detail.value);
    this.value.setFullYear(date.getFullYear());
    this.value.setMonth(date.getMonth());
    this.value.setDate(date.getDate());

    const value = this.getDateTimeFromDisplayedTimezone(this.value);
    this.onChange(value);
  }

  /** Set time value. */
  public onTimeChanged(event: CustomEvent): void {
    if (!this.value) {
      this.value = new Date();
    }
    const date = new Date(event.detail.value);
    this.setTimeValue(date.getHours(), date.getMinutes(), date.getSeconds());
    if (!this.dateTimeForm.controls.date.value) {
      return;
    }
    const value = this.getDateTimeFromDisplayedTimezone(this.value);
    this.onChange(value);
  }

  private setTimeValue(hours: number, minutes: number, seconds: number): void {
    this.value.setHours(hours);
    this.value.setMinutes(minutes);
    this.value.setSeconds(seconds);
    this.value.setMilliseconds(0);
  }

  /** Call onTouched function. */
  public onFocused(): void {
    this.onTouched();
  }

  /** Set value of inner fields. */
  public writeValue(value: Date): void {
    if (value == null) {
      return;
    }
    value = this.getDateTimeInDisplayedTimezone(value);
    try {
      this.value = new Date(value);
      const timeControl = this.dateTimeForm.controls.time;
      this.dateTimeForm.setValue({
        date: this.value.toISOString(),
        time: timeControl.disabled && !this.dateTimeForm.disabled
          ? timeControl.value : this.value.toISOString(),
      });
    } catch {
      console.error('DateTimePicker: The value passed to the field is not a valid date.');
    }
  }

  /** Register onChange function. */
  public registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  /** Register onTouched function. */
  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  /** Set disabled state of inner fields. */
  public setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.dateTimeForm.disable();
    } else {
      this.dateTimeForm.enable();
    }
  }

  /**
   * Convert date time to displayed timezone.
   * Result will contains correct date and time to display but in wrong timezone since JS works always in local timezone.
   * @param date Date to display.
   */
  private getDateTimeInDisplayedTimezone(date: Date): Date {
    if (this.timezone == null) {
      return date;
    }

    const targetZoneDateTime = DateTime.fromJSDate(date);
    const zone = this.timezone || 'local';
    /**
     * Firstly convert to certain timezone to get date time in the original timezone.
     * After that convert it to local time zone with keeping date time ot original timezone but in local.
     */
    return targetZoneDateTime.setZone(zone).setZone('local', { keepLocalTime: true }).toJSDate();
  }

  /**
   * Convert displayed date time to correct date time value.
   * @param date Displayed date to restore correct value.
   */
  private getDateTimeFromDisplayedTimezone(date: Date): Date {
    if (this.timezone == null) {
      return date;
    }

    const targetZoneDateTime = DateTime.fromJSDate(date);
    const zone = this.timezone || 'local';
    /**
     * Set local timezone and convert to certain timezone with keep date time value of displayed value.
     */
    return targetZoneDateTime.setZone('local').setZone(zone, { keepLocalTime: true }).toJSDate();
  }

  /**
   * Is "time" control visible.
   */
  public get isTimeVisible(): boolean {
    return this.mode !== 'date';
  }
}

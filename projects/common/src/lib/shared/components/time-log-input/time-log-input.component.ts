import { Component, OnInit, ChangeDetectionStrategy, forwardRef } from '@angular/core';
import {
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
  FormControl,
  NG_ASYNC_VALIDATORS,
  AsyncValidator,
  ValidationErrors,
} from '@angular/forms';
import { DestroyableBase } from '@jl/common/core';
import { JusLawValidators } from '@jl/common/core/validators/validators';
import { Observable, BehaviorSubject, Subject, merge } from 'rxjs';
import { first, map, startWith, shareReplay, tap, skip, takeUntil, withLatestFrom } from 'rxjs/operators';

type TimeLogInputOnChange = (minutes: number) => void;
type TimeLogInputOnTouched = () => void;

const TIME_POSTFIX_TO_MINUTES = {
  'd': 24 * 60,
  'h': 60,
  'm': 1,
  's': 1 / 60,
  '': 60, // Number without postfix equals an hour
};
// Postfixes to display in formatting
const POSTFIXES_TO_DISPLAY: Array<keyof typeof TIME_POSTFIX_TO_MINUTES> = ['d', 'h', 'm'];

/**
 * Accepts number of minutes and returns string in format `?h ?m`
 * @param minutes Number of minutes.
 *
 * @example
 * ```typescript
 *  console.log(mapMinutesToString(77)) // 1h 17m
 *  console.log(mapMinutesToString(33)) // 33m
 * ```
 */
function mapMinutesToString(minutes: number): string {
  const lastPostfix = POSTFIXES_TO_DISPLAY[POSTFIXES_TO_DISPLAY.length - 1];

  /**
   * Find the postfix which has a limit less than current number of minutes
   *  e.g for 70 minutes it would be 'h'
   */
  const postfix = POSTFIXES_TO_DISPLAY.find(
    p => minutes >= TIME_POSTFIX_TO_MINUTES[p],
  ) || lastPostfix;

  const timeLimit = TIME_POSTFIX_TO_MINUTES[postfix];
  const isLastPostfix = postfix === lastPostfix;

  // If it is the last postfix that we want to display, count all the reminded time
  if (isLastPostfix) {
    return `${Math.round(minutes / timeLimit)}${postfix}`;
  }

  // Otherwise, if we have postfixes lesser than current, continue the calculation
  const counted = Math.floor(minutes / timeLimit);
  const reminder = minutes - counted * timeLimit;
  const body = `${counted}${postfix}`;

  if (reminder) {
    const tail = mapMinutesToString(reminder);
    return `${body} ${tail}`;
  }

  return body;
}

/**
 * Map time string to number of minutes
 * @param val Time string. `'?h ?m' | '?h' | '?m' | number`
 *
 * @example
 * ```typescript
 *  console.log('1h 33m') // 93
 *  console.log('2h') // 180
 *  console.log('11m') // 11
 *  console.log('1.5') // 90
 * ```
 *
 * @throws An error if format is incorrect.
 */
function mapStringToMinutes(val: string): number {
  const digitRegexStr = '(([0-9]*[.])?[0-9]+)';
  const parts = val.trim().split(' ');
  const postfixes = Object.keys(TIME_POSTFIX_TO_MINUTES);
  const regex = postfixes.map(postfix => new RegExp(`^${digitRegexStr}${postfix}$`));

  return parts.reduce((acc, part) => {
    const postfixIdx = regex.findIndex(r => part.match(r));
    if (postfixIdx !== -1) {
      return acc + parseFloat(part) * TIME_POSTFIX_TO_MINUTES[postfixes[postfixIdx]];
    }
    throw new Error(`"${part}" unexpected. (Format - 1h 10m)`);
  }, 0);
}

/** Time log input component. Returns time in minutes. */
@Component({
  selector: 'jlc-time-log-input',
  templateUrl: './time-log-input.component.html',
  styleUrls: ['./time-log-input.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TimeLogInputComponent), multi: true },
    { provide: NG_ASYNC_VALIDATORS, useExisting: forwardRef(() => TimeLogInputComponent), multi: true },
  ],
})
export class TimeLogInputComponent extends DestroyableBase implements ControlValueAccessor, AsyncValidator, OnInit {

  /** Control. */
  public readonly control = new FormControl(null);

  private readonly onChangeCallbacks: TimeLogInputOnChange[] = [];
  private readonly onTouchedCallbacks: TimeLogInputOnTouched[] = [];
  private readonly validationError$ = new BehaviorSubject<string | null>(null);
  private readonly onBlur$ = new Subject<void>();

  /** @inheritdoc */
  public validate(): Observable<ValidationErrors> {
    return this.validationError$.pipe(
      first(),
      map(error => error === null ? null : JusLawValidators.buildJusLawError(error)),
    );
  }

  /** Initialize input. */
  public ngOnInit(): void {
    const valueChange$ = this.control.valueChanges.pipe(
      startWith(this.control.value),
      map((val: string | null) => this.mapToMinutesNum(val)),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );

    const onTouchedEmit$ = valueChange$.pipe(
      skip(1), // Skip initial value
      tap(() => this.onTouchedCallbacks.forEach(fn => fn())),
    );

    const onChangeEmit$ = valueChange$.pipe(
      tap(value => this.onChangeCallbacks.forEach(fn => fn(value))),
    );

    const formatControlValue$ = this.onBlur$.pipe(
      withLatestFrom(valueChange$, this.validationError$),
      tap(([_, val, error]) => {
        if (error == null) {
          const parsed = val && mapMinutesToString(val);
          this.control.setValue(parsed, { emitEvent: false });
        }
      }),
    );

    merge(
      onTouchedEmit$,
      onChangeEmit$,
      formatControlValue$,
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  private mapToMinutesNum(val: string): number {
    this.validationError$.next(null);
    try {
      const minutes = val && mapStringToMinutes(val);
      return minutes;
    } catch (error) {
      this.validationError$.next(error.message);
      return NaN;
    }
  }

  /** @inheritdoc */
  public writeValue(val: number): void {
    const formattedVal = val && mapMinutesToString(val);
    this.control.setValue(formattedVal);
  }

  /** @inheritdoc */
  public registerOnChange(fn: TimeLogInputOnChange): void {
    this.onChangeCallbacks.push(fn);
  }

  /** @inheritdoc */
  public registerOnTouched(fn: TimeLogInputOnTouched): void {
    this.onTouchedCallbacks.push(fn);
  }

  /** @inheritdoc */
  public setDisabledState(disabled: boolean): void {
    const { disable, enable } = this.control;
    disabled ? disable() : enable();
  }

  /** Emit subject on blur. */
  public onBlur(): void {
    this.onBlur$.next();
  }
}

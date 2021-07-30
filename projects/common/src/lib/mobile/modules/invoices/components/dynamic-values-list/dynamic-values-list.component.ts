import { Component, ChangeDetectionStrategy, Input, forwardRef, Self } from '@angular/core';
import { ControlValueAccessor, FormArray, FormControl, ValidatorFn, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import { TEntityValidationErrors } from '@jl/common/core/models/api-error';
import { Observable, BehaviorSubject, merge, NEVER, of, combineLatest, Subject, ReplaySubject } from 'rxjs';
import { tap, switchMapTo, first, shareReplay, } from 'rxjs/operators';

interface FormValue {
  [key: string]: string;
}

/** Control for input list of values. */
@Component({
  selector: 'jlc-dynamic-values-list',
  templateUrl: './dynamic-values-list.component.html',
  styleUrls: ['./dynamic-values-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicValuesListControlComponent),
      multi: true,
    },
  ],
})
export class DynamicValuesListControlComponent implements ControlValueAccessor {

  /** List of validators. */
  @Input()
  public itemValidators: ValidatorFn[];

  /** Validation errors. */
  @Input()
  public jlcApiValidation: TEntityValidationErrors<FormValue>;

  /** Form value. */
  public form$: Observable<FormArray>;

  private disabledStateChange$ = new BehaviorSubject<boolean>(false);
  private initValue$ = new ReplaySubject<string[]>(1);
  private newControl$ = new Subject<void>();

  private onChange(_: string[]): void { }
  private onTouched(): void { }

  public constructor() {
    this.form$ = this.initFormStream();
  }

  /** @inheritdoc */
  public writeValue(emailsList: string[]): void {
    this.initValue$.next(emailsList || []);
  }

  /** @inheritdoc */
  public registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  /** @inheritdoc */
  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  /** @inheritdoc */
  public setDisabledState?(isDisabled: boolean): void {
    this.disabledStateChange$.next(isDisabled);
  }

  /** On remove control clicked. */
  public onRemoveControlClick(form: FormArray, controlToDelete: FormControl): void {
    form.removeAt(form.controls.findIndex((control) => control === controlToDelete));
  }

  /** On add control clicked. */
  public onAddControlClick(): void {
    this.newControl$.next();
  }

  /**
   * Trackby function.
   * @param control Control.
   */
  public trackControl(control: FormControl): FormControl {
    return control;
  }

  private initFormStream(): Observable<FormArray> {
    const form = new FormArray([]);

    const disableForm$ = this.disabledStateChange$.pipe(
      tap((shouldDisable) => shouldDisable ? form.disable() : form.enable()),
    );

    const emitOnChange$ = form.valueChanges.pipe(
      tap((value) => this.onChange(this.formValueToArray(value))),
    );

    const emitOnTouched$ = form.valueChanges.pipe(
      first(),
      tap(() => this.onTouched()),
    );

    const rebuildForm$ = this.initValue$.pipe(
      tap(valuesList => this.rebuildForm(form, valuesList)),
    );

    const addControl$ = this.newControl$.pipe(
      tap(() => form.push(this.buildFormControl())),
    );

    const formSideEffect$ = combineLatest([
      disableForm$,
      rebuildForm$,
      emitOnChange$,
      emitOnTouched$,
      addControl$,
    ]).pipe(
      switchMapTo(NEVER),
    );

    return merge(of(form), formSideEffect$).pipe(
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }

  private rebuildForm(form: FormArray, valueList: string[]): void {
    form.clear();
    const values = valueList.length > 0 ? valueList : [''];
    values.forEach(value => form.push(this.buildFormControl(value)));
  }

  private buildFormControl(value?: string): FormControl {
    return new FormControl(value, this.itemValidators);
  }

  private formValueToArray(this: void, formValue: FormValue): string[] {
    const keys = Object.keys(formValue);
    return keys.map(key => formValue[key]).filter(value => value);
  }
}

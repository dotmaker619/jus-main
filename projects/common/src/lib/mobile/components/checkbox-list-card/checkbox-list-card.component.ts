import { Component, ChangeDetectionStrategy, Input, forwardRef, ChangeDetectorRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

const CHECKED_ICON_SRC = '/assets/icons/checkbox_on.svg';
const UNCHECKED_ICON_SRC = '/assets/icons/checkbox_off.svg';

/** Checklist card. Used in mobile workspace. */
@Component({
  selector: 'jlc-checkbox-list-card',
  templateUrl: './checkbox-list-card.component.html',
  styleUrls: ['./checkbox-list-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxListCardComponent),
      multi: true,
    },
  ],
})
export class CheckboxListCardComponent implements ControlValueAccessor {
  /**
   * Array of options to select.
   * May be any objects, the value of a component is a subset of these options.
   * Default property key for identificator is 'value'. For human-readable label property - 'label'.
   * The keys of properties might be customized with _idPropertyName_ and _descriptionPropertyName_ values.
   */
  @Input()
  public options: unknown[];
  /** Unique identificator property. */
  @Input()
  public idPropertyName = 'value';
  /** Description property name. */
  @Input()
  public descriptionPropertyName = 'label';

  /** Is form control disabled. */
  public isDisabled = false;

  private selectedValues = [];
  private dirty = false;

  /**
   * @constructor
   * @param cdr Change detector.
   */
  public constructor(
    private readonly cdr: ChangeDetectorRef,
  ) { }

  /** On touched callback. */
  public onTouched(): void { }

  /** On change callback. */
  public onChange(_: any): void { }

  /** @inheritdoc */
  public writeValue(selected: unknown[]): void {
    this.selectedValues = selected || [];
    // Explicitly mark for check after updating the selected values.
    this.cdr.markForCheck();
  }

  /** @inheritdoc */
  public registerOnChange(fn: (_: any) => void): void {
    this.onChange = fn;
  }

  /** @inheritdoc */
  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  /** @inheritdoc */
  public setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  /** Toggle selected option. */
  public toggleSelectedOption(option: unknown): void {
    if (this.isDisabled) {
      return;
    }

    const selectedIdx = this.selectedValues.findIndex(
      selected => selected[this.idPropertyName] === option[this.idPropertyName],
    );

    if (selectedIdx === -1) {
      this.selectedValues.push(option);
    } else {
      this.selectedValues.splice(selectedIdx, 1);
    }

    this.onChange(this.selectedValues);

    // Set touched.
    if (!this.dirty) {
      this.onTouched();
      this.dirty = true;
    }
  }

  /**
   * Trackby function.
   * @param _ Idx.
   * @param item Item.
   * @returns Unique identifier value.
   */
  public trackByValue = (_: number, item: unknown): unknown => {
    return item[this.idPropertyName];
  }

  /**
   * Get icon for checkbox.
   * @param option Option.
   */
  public getIconSrc(option: unknown): string {
    const isOptionSelected = !!this.selectedValues.find(
      o => option[this.idPropertyName] === o[this.idPropertyName],
    );
    return isOptionSelected ? CHECKED_ICON_SRC : UNCHECKED_ICON_SRC;
  }
}

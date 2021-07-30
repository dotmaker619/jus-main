import { FormArray, FormGroup, FormControl, ValidatorFn, AbstractControlOptions, AsyncValidatorFn } from '@angular/forms';

/**
 * Form checkboxes array control.
 * FormCheckboxesSelect<T>.value is a list of checked items (provided as items: T[]).
 */
export class FormCheckboxesSelect<T> extends FormArray {
  /**
   * @constructor
   * @param items Checkbox items.
   * @param isCheckedSelector Is item checked selector.
   * @param validatorOrOpts A synchronous validator function, or an array of
   * such functions, or an `AbstractControlOptions` object that contains validation functions
   * and a validation trigger.
   * @param asyncValidator A single async validator or array of async validator functions
   */
  // tslint:disable-next-line: max-line-length
  public constructor(items: T[], isCheckedSelector?: (item: T) => boolean, validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null, asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null) {
    isCheckedSelector = isCheckedSelector || (() => false);
    const controls = items.map(item => new FormCheckbox(item, isCheckedSelector(item)));
    super(controls, validatorOrOpts, asyncValidator);
  }

  /**
   * @inheritdoc
   */
  public controls: FormCheckbox<T>[];

  /**
   * Get selected items.
   */
  public getSelectedItems(): T[] {
    return this.controls
      .filter(control => control.isCheckedValue)
      .map(control => control.checkBoxItem);
  }

  /**
   * Get unselected items.
   */
  public getUnselectedItems(): T[] {
    return this.controls
      .filter(control => control.isCheckedValue)
      .map(control => control.checkBoxItem);
  }

  /**
   * Set new items.
   * @param items New items.
   */
  public setItems(items: T[], isCheckedSelector?: (item: T) => boolean): void {
    isCheckedSelector = isCheckedSelector || (() => false);
    this.controls = items.map(item => new FormCheckbox(item, isCheckedSelector(item)));
  }

  /**
   * Override to extract values.
   */
  private _updateValue(): void {
    const selectedItems = this.controls.filter(control => (control.enabled || this.disabled) && control.isCheckedValue)
    .map(control => control.checkBoxItem);
    (this as any).value = selectedItems.length === 0 ? null : selectedItems;
  }
}

/**
 * Form checkbox.
 */
export class FormCheckbox<T> extends FormGroup {
  private isCheckedControl: FormControl;
  private itemControl: FormControl;

  /**
   * @constructor
   * @param item Checkbox item.
   * @param isChecked Initial "checked" value.
   */
  public constructor(item: T, isChecked: boolean = false) {
    const isCheckedControl = new FormControl(isChecked, { updateOn: 'change' });
    const itemControl = new FormControl(item);
    super({
      isChecked: isCheckedControl,
      item: itemControl,
    });
    this.isCheckedControl = isCheckedControl;
    this.itemControl = itemControl;
  }

  /**
   * "Is Checked" value.
   */
  public get isCheckedValue(): boolean {
    return this.isCheckedControl.value as boolean;
  }

  /**
   * Checkbox item value.
   */
  public get checkBoxItem(): T {
    return this.itemControl.value as T;
  }
}

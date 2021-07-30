import { ValidationErrors, ValidatorFn, AbstractControl, FormGroup, NgControl, FormControl, Validators } from '@angular/forms';

import { FormCheckboxesSelect } from '../forms';
import { JusLawFile } from '../models/juslaw-file';
import { ValidationErrorCode } from '../models/validation-error-code';

const DEFAULT_DATE_RANGE_VALIDATOR_MESSAGE = 'End date is earlier than the start date';

export namespace JusLawValidators {
  /**
   * Checks whether the current control matches another.
   * @param controlName Control name to check matching with.
   * @param controlTitle Control title to display for a user.
   */
  // tslint:disable-next-line: completed-docs
  export function matchControl(controlName: string, controlTitle: string = controlName): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.parent && control.parent.controls[controlName].value !== control.value) {
        return {
          [ValidationErrorCode.Match]: {
            controlName,
            controlTitle,
          },
        };
      }
      return null;
    };
  }

  /**
   * Checks whether all the checkboxes are checked.
   * @param checkboxArrayName Name of the checkbox array.
   */
  // tslint:disable-next-line: completed-docs
  export function allChecked(checkboxArrayName: string): ValidatorFn {
    return (formArray: FormCheckboxesSelect<any>): ValidationErrors => {
      if (formArray.controls.some((control) => !control.isCheckedValue)) {
        return {
          [ValidationErrorCode.JusLawError]: {
            message: 'All the checkboxes should be selected before submitting',
          },
        };
      }
    };
  }

  /**
   * Check if elements are presented in form value array.
   * @param comparator Comparator function.
   */
  // tslint:disable-next-line: completed-docs
  export function containsAll<T>(
    comparator: (v1: T, v2: T) => boolean,
    array: T[],
    message: string = 'Required values were not selected/presented'): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!(control.value instanceof Array)) {
        return {
          [ValidationErrorCode.JusLawError]: {
            message: 'Value of form control is incorrect',
          },
        };
      }

      const isError = array.some(
        (val) => !control.value.find(
          (controlVal => comparator(controlVal, val)),
        ),
      );
      if (isError) {
        return {
          [ValidationErrorCode.JusLawError]: {
            message,
          },
        };
      }
    };
  }

  /**
   * Verify that the Array Form control does not have a single`null` value.
   *
   * @param controlName Control name to check matching with.
   * @param controlTitle Control title to display for a user.
   */
  // tslint:disable-next-line: completed-docs
  export function hasNotNullValue(controlName: string, controlTitle: string = controlName): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const isInvalid = control.parent && control.touched && control.value.length === 1 && control.value[0] == null;

      return isInvalid
        ? { [ValidationErrorCode.HasEmptyValue]: { controlName, controlTitle } }
        : null;
    };
  }

  /**
   * Date range validator.
   * Validates that start date earlier than end date.
   * @param startControlName Control name with start date value.
   * @param endControlName Control name with end date value.
   * @param errorMessage Error message to display.
   */
  // tslint:disable-next-line: completed-docs
  export function dateRange(startControlName: string, endControlName: string,
    errorMessage: string = DEFAULT_DATE_RANGE_VALIDATOR_MESSAGE): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      /**
       * This validator is allowed to apply on certain Form Control or to Form Group.
       * If attached to Form Group the this group should contain certain controls.
       */
      const parent = control instanceof FormGroup
        ? control
        : control.parent;

      const startDate = parent.get(startControlName).value;
      const endDate = parent.get(endControlName).value;

      const isValid = startDate == null || endDate == null || startDate <= endDate;
      if (isValid) {
        return null;
      }

      return {
        [ValidationErrorCode.DateTimeRange]: errorMessage,
      };
    };
  }

  /**
   * Minimum date validator.
   *
   * @param date Value to compare controls' value with.
   */
  // tslint:disable-next-line: completed-docs
  export function minDate(date: Date): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!(control.value instanceof Date)) {
        return {
          [ValidationErrorCode.JusLawError]: {
            message: 'Value of form control is incorrect',
          },
        };
      }

      const isInvalid = control.touched && control.value < date;
      return isInvalid
        ? { [ValidationErrorCode.MinDate]: date }
        : null;
    };
  }

  /**
   * Validate array of emails.
   * @param control Control.
   */
  // tslint:disable-next-line: completed-docs
  export function emailList(control: AbstractControl): ValidationErrors | null {
    const isInvalid = (control.value as Array<string>)
      .some(recipient => {
        const tempControl = new FormControl(recipient, [Validators.required, Validators.email]);

        return tempControl.invalid;
      });
    return isInvalid
      ? { [ValidationErrorCode.JusLawError]: { message: 'List of emails is incorrect', } }
      : null;
  }

  /**
   * Validate the min number of files.
   * @param minLength Min number of files.
   */
  // tslint:disable-next-line: completed-docs
  export function minFiles(minLength: number = 0): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value as Array<unknown | File | JusLawFile>;

      if (value.length < minLength) {
        return buildJusLawError(`More than ${minLength} files is required`);
      }

      return null;
    };
  }

  /**
   * Validate on min number of items in value.
   * @param minLength Min length of array.
   */
  // tslint:disable-next-line: completed-docs
  export function minItems(minLength: number = 0): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value == null || control.value.length < minLength) {
        return buildJusLawError(`At least ${minLength} item(s) should be selected`);
      }
    };
  }

  /**
   * Create validation error from a message.
   * @param message Message to create an error from.
   */
  // tslint:disable-next-line: completed-docs
  export function buildJusLawError(message: string): ValidationErrors {
    return {
      [ValidationErrorCode.JusLawError]: {
        message,
      },
    };
  }
}

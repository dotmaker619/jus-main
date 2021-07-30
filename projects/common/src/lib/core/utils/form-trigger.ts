import { FormGroup, FormControl } from '@angular/forms';

/**
   * Triggers validation on controls.
   * @param formGroup - The form group to touch
   */
export function triggerValidation(formGroup: FormGroup): void {
  (<any>Object).values(formGroup.controls).forEach((control: FormControl | FormGroup) => {
    control.markAsTouched();
    control.updateValueAndValidity();

    if (control instanceof FormGroup) {
      triggerValidation(control);
    }
  });
}

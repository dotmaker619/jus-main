import { Component, ChangeDetectionStrategy, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, FormControl, ValidationErrors, Validator } from '@angular/forms';
import { TEntityValidationErrors } from '@jl/common/core/models/api-error';
import { JusLawValidators } from '@jl/common/core/validators/validators';

const ACCESSOR_PROVIDER = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => EmailListInputComponent),
  multi: true,
};

const VALIDATOR_PROVIDER = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => EmailListInputComponent),
  multi: true,
};

/**
 * Component to type a list of emails.
 *
 * @description
 * This component should be used with formControl or formControlName directive.
 * Control's value is array of strings.
 */
@Component({
  selector: 'jlc-email-list-input',
  templateUrl: './email-list-input.component.html',
  styleUrls: ['./email-list-input.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    ACCESSOR_PROVIDER,
    VALIDATOR_PROVIDER,
  ],
})
export class EmailListInputComponent implements ControlValueAccessor, Validator {
  /** Input value. */
  public value: string;

  /** Validation errors. */
  @Input()
  public jlcApiValidation: TEntityValidationErrors<any>;

  /** Placeholder message */
  @Input()
  public placeholder = '';

  /** @inheritdoc */
  public onChange: (_: string[]) => void;
  /** @inheritdoc */
  public onTouched: () => void;

  /** @inheritdoc */
  public writeValue(value: any): void {
    if (value == null) {
      return;
    }
    if (Array.isArray(value)) {
      this.value = value.join(', ');
    } else {
      throw new Error('Incorrect initial value. Pass array of emails');
    }
  }

  /** @inheritdoc */
  public registerOnChange(fn: (_: string[]) => void): void {
    this.onChange = fn;
  }

  /**
   * Handle 'input' event.
   * @param val Input value.
   */
  public onInputChange(val: string): void {
    const emailArray = val
      .split(',')
      .map(recipient => recipient.trim());
    this.onChange(emailArray);
  }

  /** @inheritdoc */
  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /** @inheritdoc */
  public validate(control: FormControl): ValidationErrors | null {
    return JusLawValidators.emailList(control);
  }
}

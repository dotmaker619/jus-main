import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { ValidationErrorCode } from '@jl/common/core/models/validation-error-code';

/**
 * Validation error messages.
 */
const ValidationErrorMessageFactories = {
  [ValidationErrorCode.Email]: () => 'Email is not valid',
  [ValidationErrorCode.Required]: () => 'This property is required',
  [ValidationErrorCode.Match]: ({ controlTitle }) => `Value does not match with "${controlTitle}"`,
  [ValidationErrorCode.MinLength]: ({ requiredLength }) => `Minimal length is ${requiredLength}`,
  [ValidationErrorCode.MaxLength]: ({ requiredLength }) => `Maximum length is ${requiredLength} characters`,
  [ValidationErrorCode.Pattern]: () => 'Value does not satisfy the pattern',
  [ValidationErrorCode.JusLawError]: ({ message }) => message,
  [ValidationErrorCode.Min]: ({ min }) => `Minimum value is ${min}`,
  [ValidationErrorCode.Max]: ({ max }) => `Maximum value is ${max}`,
  [ValidationErrorCode.HasEmptyValue]: ({ controlTitle }) => `${controlTitle} must contain at least one value`,
  [ValidationErrorCode.DateTimeRange]: (message) => message,
  [ValidationErrorCode.MinDate]: (min: Date) => `Minimum date value is ${min.toLocaleDateString()}`,
};

/**
 * Validation error renderer component.
 */
@Component({
  selector: 'jlc-validation-message',
  templateUrl: './validation-message.component.html',
  styleUrls: ['./validation-message.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValidationMessageComponent {
  /**
   * Validation errors.
   */
  @Input()
  public errors: ValidationErrors;

  /**
   * Error message as a string.
   */
  public get errorMessage(): string {
    if (this.errors == null) {
      return null;
    }
    const errorCode = Object.keys(this.errors)[0];
    return this.getErrorMessage(errorCode, this.errors[errorCode]);
  }

  /**
   * Get error message for specific validation error.
   * @param errorCode Error code (minlength, required and etc.)
   * @param errorData Data of error. See details of HTTP validation errors or implementation of custom.
   * For instance data of minlength error is: { actualLength, requiredLength }.
   */
  private getErrorMessage(errorCode: string, errorData: any): string {
    // TODO: (Danil) add logic to get max/min length requirements.
    const factory = ValidationErrorMessageFactories[errorCode];
    if (factory == null) {
      console.warn(`Can not find validation message factory for error: ${errorCode}`);
      return 'Value is not valid';
    }
    return factory(errorData);
  }
}

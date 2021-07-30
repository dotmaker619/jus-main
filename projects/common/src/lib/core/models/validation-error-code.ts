/**
 * Validation error code.
 */
export enum ValidationErrorCode {
  /**
   * Wrong email.
   */
  Email = 'email',
  /**
   * Required field.
   */
  Required = 'required',
  /**
   * Match of values error. When value of one control does not match to another.
   */
  Match = 'match',
  /**
   * Minimal length restriction.
   */
  MinLength = 'minlength',
  /**
   * Maximal length restriction.
   */
  MaxLength = 'maxlength',
  /**
   * Maximum value restriction.
   */
  Min = 'min',
  /**
   * Minimum value restriction.
   */
  Max = 'max',
  /**
   * Pattern restriction.
   */
  Pattern = 'pattern',
  /**
   * Jus law error.
   */
  JusLawError = 'jusLawError',
  /**
   * Some array has empty values.
   */
  HasEmptyValue = 'hasEmptyValue',
  /**
   * Date time range restriction.
   */
  DateTimeRange = 'dateTimeRange',
  /**
   * Minimum value for date.
   */
  MinDate = 'minDate',
}

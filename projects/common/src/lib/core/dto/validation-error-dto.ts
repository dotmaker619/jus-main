/**
 * Validation error DTO.
 * If a property has primitive type (number, string), then errors - is an array of strings.
 * If a property is an object, then errors is an array of strings if property is null but required e.g.
 * or is nested ValidationErrorDto<T> object.
 * If a property is an array, then errors is an object where key is name of property
 * and value is array of errors (index in this array corresponds to index of item in the original array)
 */
export type ValidationErrorDto<T> = {
  [P in keyof T]?: T[P] extends (infer K)[] ? ValidationErrorDto<K> :
    T[P] extends object ? ValidationErrorDto<T[P]> | string[] : string[];
} & {
  /**
   * Non field errors.
   */
  non_field_errors?: string[];
};

/**
 * Extract errors message from error data.
 * @param errorData Error data.
 * @returns The first item if error data is a array of error messages.
 * Error message from non_field_errors if it presented.
 * Error message of the first key if error data is error for composite object like City: { id, name }.
 */
export function extractErrorMessage<T>(errorData: ValidationErrorDto<T> | string[] | null | undefined): string | undefined {
  if (errorData == null) {
    return;
  }
  if (Array.isArray(errorData)) {
    return extractErrorMessageFromArray(errorData);
  }
  if (typeof errorData === 'object') {
    // Just get non field error as a result.
    if (errorData.non_field_errors != null) {
      return extractErrorMessageFromArray(errorData.non_field_errors);
    }
    // Otherwise extract an error from first property.
    const key = Object.keys(errorData)[0];
    return extractErrorMessage(errorData[key]);
  }
}

function extractErrorMessageFromArray(errors: string[]): string {
  if (errors.length === 0) {
    throw new Error('Empty errors array');
  }
  const error = errors[0];
  if (typeof error !== 'string') {
    throw new Error(`String expected but ${typeof error} has gotten`);
  }
  return error;
}

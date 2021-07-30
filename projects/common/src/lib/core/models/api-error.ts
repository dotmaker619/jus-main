/**
 * Entity validation errors type.
 * Describes validation items for target entity.
 */
export type TEntityValidationErrors<T> = {
  /**
   * Error message for certain entity property.
   */
  [P in keyof T]?: PropValidationMessage<T[P]> | string;
};

/**
 * Validation message type for specific property type.
 * Could be a just error message for simple field or nested validation error for composite fields.
 */
export type PropValidationMessage<T> =
  T extends any[] ? string :
  T extends object ? TEntityValidationErrors<T> : string;

/**
 * Common API error.
 */
export class ApiError extends Error {
  /**
   * Error message.
   */
  public readonly message: string;

  /**
   * Response status.
   */
  public readonly status: string;

  /**
   * @constructor
   * @param apiError Initialize API error data.
   */
  public constructor(apiError: Partial<ApiError>) {
    super(apiError.message);
    this.message = apiError.message;
    this.status = apiError.status;
  }
}

/**
 * Api validation error for certain Entity.
 */
export class ApiValidationError<TEntity extends object> extends ApiError {
  /**
   * @constructor
   * @param data Initialize data.
   */
  public constructor(data: Partial<ApiValidationError<TEntity>>) {
    super(data);
    this.validationData = data.validationData || {};
  }

  /**
   * Validation errors for entity fields.
   */
  public readonly validationData: TEntityValidationErrors<TEntity>;
}

import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ValidationErrorMapper, MapperFromDto } from '@jl/common/core/mappers/mapper';
import { ApiError, ApiValidationError } from '@jl/common/core/models/api-error';
import { MonoTypeOperatorFunction, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * Error mapper type declaration.
 * Could be a simple function to transform errors from DTO to errors of domain model
 * or implementation of IMapper with implemented validationErrorFromDto method.
 */
export type ErrorMapper<TDto, TEntity extends object> = ValidationErrorMapper<TDto, TEntity> |
  ValidationErrorMapper<TDto, TEntity>['validationErrorFromDto'];

/** Mapper for api errors */
@Injectable({
  providedIn: 'root',
})
export class ApiErrorMapper implements MapperFromDto<HttpErrorResponse, ApiError> {
  /** Convert default HttpErrorResponse object to custom ApiError */
  public fromDto(httpError: HttpErrorResponse): ApiError {
    const message = typeof httpError.error === 'string'
      ? httpError.error
      : httpError.error.detail;
    return new ApiError({
      message,
      status: httpError.status.toString(),
    });
  }

  /**
   * Map HTTP API error response to the appropriate Api error model.
   * @param httpError Http error.
   * @param validationErrorMapper Mapper function that transform validation DTO errors to the application validation model.
   * @returns ApiError if httpError is not "Bad Request" error or ApiValidationError if it is "Bad Request"/
   */
  public fromDtoWithValidationSupport<TDto, TEntity extends object>(
    httpError: HttpErrorResponse,
    mapper: ErrorMapper<TDto, TEntity>,
  ): ApiError | ApiValidationError<TEntity> {
    if (httpError.status !== 400) {
      // It is not a validation error. Return simple ApiError.
      return this.fromDto(httpError);
    }

    if (mapper == null) {
      throw new Error('Provide mapper for API errors.');
    }

    if (typeof mapper !== 'function' && mapper.validationErrorFromDto == null) {
      throw new Error('Provided mapper does not have implementation of validationErrorFromDto');
    }

    // This is a validation error => create ApiValidationError.
    return new ApiValidationError<TEntity>({
      validationData: typeof mapper === 'function'
        ? mapper(httpError.error.data)
        : mapper.validationErrorFromDto(httpError.error.data),
      status: httpError.status.toString(),
      message: httpError.error.detail,
    });
  }

  /**
   * Catch Api Validation Error RxJS operator.
   * Catches only ApiValidationError<T> errors.
   * @param callback s
   */
  public catchHttpErrorToApiError<T>(): MonoTypeOperatorFunction<T> {
    return catchError((httpError: HttpErrorResponse) => {
      const apiError = this.fromDto(httpError);
      return throwError(apiError);
    });
  }

  /**
   * RxJS operator to catch and map HTTP API error response to the appropriate Api error model.
   * @param mapper Mapper function that transform validation DTO errors to the application validation model.
   * @returns ApiError if httpError is not "Bad Request" error or ApiValidationError if it is "Bad Request"
   */
  public catchHttpErrorToApiErrorWithValidationSupport<T, TDto, TEntity extends object>(
    mapper: ErrorMapper<TDto, TEntity>): MonoTypeOperatorFunction<T> {
    return catchError((httpError: HttpErrorResponse) => {
      const apiError = this.fromDtoWithValidationSupport<TDto, TEntity>(httpError, mapper);
      return throwError(apiError);
    });
  }
}

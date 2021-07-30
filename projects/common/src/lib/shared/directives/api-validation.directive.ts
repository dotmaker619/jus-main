import { Directive, Input, OnInit, OnDestroy } from '@angular/core';
import { AbstractControl, NgControl } from '@angular/forms';
import { TEntityValidationErrors } from '@jl/common/core/models/api-error';
import { ValidationErrorCode } from '@jl/common/core/models/validation-error-code';
import { Observable, BehaviorSubject, NEVER, of, Subject } from 'rxjs';
import { switchMap, tap, map, takeUntil, startWith } from 'rxjs/operators';

/**
 * Form control directive to display API validation errors.
 */
@Directive({
  // tslint:disable-next-line: max-line-length
  selector: '[ngModel][jlcApiValidation],[formControl][jlcApiValidation],[formControlName][jlcApiValidation],[formArrayName][jlcApiValidation]',
})
export class ApiValidationDirective implements OnInit, OnDestroy {
  private errorsChange$ = new BehaviorSubject<TEntityValidationErrors<any> | Observable<TEntityValidationErrors<any>> | string>(null);
  private destroy$ = new Subject<void>();

  /**
   * @constructor
   * @param ngControl Control to work with.
   */
  public constructor(private ngControl: NgControl) {
  }

  /**
   * Errors.
   * Simple value of an Observable.
   */
  @Input('jlcApiValidation')
  public set errors(value: TEntityValidationErrors<any> | Observable<TEntityValidationErrors<any>>) {
    this.errorsChange$.next(value);
  }

  /**
   * Path to certain error in `errors`. If not specific then `path` of `NgControl` will be used.
   */
  @Input()
  public path?: string[];

  /**
   * @inheritdoc
   */
  public ngOnInit(): void {
    this.createInvalidationStream()
      .pipe(
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  /**
   * @inheritdoc
   */
  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createInvalidationStream(): Observable<any> {
    const { ngControl } = this;
    const errorMessage$ = this.errorsChange$
      .pipe(
        switchMap(errorOrStream => {
          // Errors could be provided as an object or as an Observable.
          if (errorOrStream == null) {
            return of (null);
          }
          if (errorOrStream instanceof Observable) {
            return errorOrStream;
          }
          return of(errorOrStream);
        }),
        map(errors => {
          // If this is an exactly error message, then just use it.
          if (typeof errors === 'string') {
            return errors;
          }
          // If specific path provided then use it otherwise use path of NgControl.
          const path = this.path || ngControl.path;
          return this.extractError(errors, path);
        }),
      );

    // Display error and hide it if value was changed.
    return errorMessage$
        .pipe(
          switchMap(errorMessage => {
            const { control } = ngControl;
            if (errorMessage == null) {
              // Run validators to reset current error.
              this.updateControlError(control, null);
              return NEVER;
            }
            const valueWhenError = control.value;
            return ngControl.valueChanges
              .pipe(
                startWith(valueWhenError),
                tap(value => {
                  // If value the same for that we got this error, then display it otherwise hide it.
                  const controlErrorMessage = value === valueWhenError
                    ? errorMessage
                    : null;
                  this.updateControlError(control, controlErrorMessage);
                }),
              );
          }),
        );
  }

  /**
   * Update error of certain control. Reset validation error if error is null.
   * @param control Certain control.
   * @param error Error to display.
   */
  private updateControlError(control: AbstractControl, error: string | null): void {
    if (error == null) {
      // If not value then remove it from control if presented.
      if (control.errors != null) {
        delete control.errors[ValidationErrorCode.JusLawError];
      }
      return;
    }
    control.setErrors({
      ...control.errors, // Save other errors.
      [ValidationErrorCode.JusLawError]: {
        message: error,
      },
    });
    control.markAsDirty();
    control.markAsTouched();
  }

  /**
   * Extract error of the current control.
   * @param error Errors object or certain error.
   * @param path Path to a certain error in the `error` object.
   */
  private extractError(error: TEntityValidationErrors<any> | string, path: string[]): string | null {
    if (error == null) {
      return null;
    }
    if (path.length === 0) {
      if (!(typeof error === 'string')) {
        // tslint:disable-next-line: max-line-length
        console.warn('Could not extract error message for form control because path is empty and error is not a string. Use [path] input to provide some specific path');
        return null;
      }
      return error as string;
    }
    const propertyName = path[0];
    const propertyError = error[propertyName];
    if (propertyError == null) {
      return null;
    }
    const nestedPath = path.slice(1);
    return this.extractError(propertyError, nestedPath);
  }
}

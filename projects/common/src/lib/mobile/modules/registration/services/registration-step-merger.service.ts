import { Injectable } from '@angular/core';
import { ClientRegistration } from '@jl/common/core/models';
import { TEntityValidationErrors } from '@jl/common/core/models/api-error';
import { AttorneyRegistration } from '@jl/common/core/models/attorney-registration';
import { INITIAL_ATTORNEY_REGISTRATION_DATA } from '@jl/common/shared/modules/registration/registration-constants';
import { Observable, BehaviorSubject, ReplaySubject } from 'rxjs';
import { filter } from 'rxjs/operators';

type RegistrationType = ClientRegistration | AttorneyRegistration;

/**
 * Registration merger.
 *
 * @description Service is used for merging the registration separated by steps.
 */
@Injectable({ providedIn: 'root' })
export class RegistrationStepMergerService<T extends RegistrationType = RegistrationType> {
  private readonly registrationData$ = new BehaviorSubject<T>(null);
  private readonly validationError$ = new ReplaySubject<TEntityValidationErrors<T>>(1);

  /** Obtain registration data. */
  public getRegistrationData(): Observable<T> {
    return this.registrationData$.pipe(
      filter(data => data != null),
    );
  }

  /**
   * Set registration data.
   * @param newData Portion of registration data.
   */
  public setRegistrationData(newData: Partial<T>): void {
    const prevData = this.registrationData$.value || INITIAL_ATTORNEY_REGISTRATION_DATA;
    this.registrationData$.next({
      ...prevData,
      ...newData,
    } as T);
  }

  /** Obtain registration data. */
  public getValidationError(): Observable<TEntityValidationErrors<T>> {
    return this.validationError$.asObservable();
  }

  /**
   * Set registration data.
   * @param data Portion of registration data.
   */
  public setValidationError(error: TEntityValidationErrors<T>): void {
    this.validationError$.next(error);
  }

  /**
   * Clear registration data.
   */
  public clearRegistrationData(): void {
    this.registrationData$.next(null);
    this.validationError$.next(null);
  }
}

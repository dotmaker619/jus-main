import { Injectable } from '@angular/core';
import { SelectOption } from '@jl/common/core/models';
import { RateType } from '@jl/common/core/models/rate-type';
import { Observable, of } from 'rxjs';

/** Rate type services. */
@Injectable({
  providedIn: 'root',
})
export class RateTypeService {

  /** Get rate types. */
  public getRateTypeOptions(): Observable<SelectOption[]> {
    return of(RateType.toArray().map(rateType => ({
      value: rateType,
      label: RateType.toReadable(rateType),
    })));
  }
}

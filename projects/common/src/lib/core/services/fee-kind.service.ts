import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PaginationDto } from '@jl/common/core/dto';
import { FeeKindDto } from '@jl/common/core/dto/fee-kind-dto';
import { FeeKindMapper } from '@jl/common/core/mappers/fee-kind.mapper';
import { FeeKind } from '@jl/common/core/models/fee-kind';
import { AppConfigService } from '@jl/common/core/services/app-config.service';
import { Observable } from 'rxjs';
import { map, share } from 'rxjs/operators';

/** Fee kind service. */
@Injectable({
  providedIn: 'root',
})
export class FeeKindService {

  private readonly feeKindsUrl = new URL('users/fee-kinds/', this.appConfig.apiUrl).toString();

  constructor(private http: HttpClient, private feeKindMapper: FeeKindMapper, private appConfig: AppConfigService) {}

  /** Get fee kinds. */
  public getFeeKinds(): Observable<FeeKind[]> {
    return this.http.get<PaginationDto<FeeKindDto>>(this.feeKindsUrl).pipe(
      map(pagination => pagination.results),
      map(results =>
        results.map(feeKind => this.feeKindMapper.fromDto(feeKind)),
      ),
      share(),
    );
  }
}

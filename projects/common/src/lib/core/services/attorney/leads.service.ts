import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PaginationDto } from '@jl/common/core/dto';
import { LeadDto, CreateLeadDto } from '@jl/common/core/dto/lead-dto';
import { LeadMapper } from '@jl/common/core/mappers/lead.mapper';
import { Lead } from '@jl/common/core/models/lead';
import { LeadPriority } from '@jl/common/core/models/lead-priority';
import { AppConfigService } from '@jl/common/core/services/app-config.service';
import { Observable, Subject, combineLatest, ReplaySubject } from 'rxjs';
import { map, publishReplay, refCount, switchMap, startWith, tap, shareReplay } from 'rxjs/operators';

import { Client, Topic } from '../../models';
import { Attorney } from '../../models/attorney';
import { Role } from '../../models/role';
import { User } from '../../models/user';

const DEFAULT_LEAD_PRIORITY: LeadDto['priority'] = 'medium';

/**
 * Leads service.
 */
@Injectable({
  providedIn: 'root',
})
export class LeadsService {
  private readonly leadsUrl = new URL('business/leads/', this.appConfig.apiUrl).toString();
  /**
   * Subject to notify that some lead was changed or created.
   */
  private readonly leadChange$ = new Subject<Lead>();
  /**
   * Subject to react on notifications update.
   */
  private readonly updateLeads$ = new ReplaySubject<void>(1);
  /**
   * Leads subject.
   */
  public readonly leads$ = combineLatest([
    this.leadChange$,
    /**
     * Notifies when app state changed from outside.
     * This way we would be sure that the leads are always updated and fresh.
     */
    this.updateLeads$,
  ]).pipe(
    startWith(null), // For the first request.
    switchMap(() => {
      // Re-get leads after every lead change and notifications update.
      return this.getLeads();
    }),
    publishReplay(1),
    refCount(),
  );

  /**
   * @constructor
   *
   * @param appConfig App config service.
   * @param http HttpClient service.
   * @param leadMapper Lead mapper service.
   */
  constructor(
    private readonly appConfig: AppConfigService,
    private readonly http: HttpClient,
    private readonly leadMapper: LeadMapper,
  ) { }

  /** Trigger updating leads. */
  public updateLeads(): void {
    this.updateLeads$.next();
  }

  /**
   * Get leads.
   */
  private getLeads(): Observable<Lead[]> {
    return this.http.get<PaginationDto<LeadDto>>(this.leadsUrl)
      .pipe(
        map(({ results }) => results),
        map(leads => leads.map(lead => this.leadMapper.fromDto(lead))),
      );
  }

  /**
   * Get lead information for specific client.
   * @param client Client to find attorney information.
   */
  public getLead(client: Client, attorney: Attorney): Observable<Lead | null> {
    const params = new HttpParams()
      .set('client', client.id.toString())
      .set('attorney', attorney.id.toString());

    return this.http.get<PaginationDto<LeadDto>>(this.leadsUrl, { params })
      .pipe(
        map(({ results }) => {
          if (results.length > 1) {
            throw new Error('Have found multiple leads for specific client and attorney.');
          }
          if (results.length === 0) {
            return null;
          }
          return this.leadMapper.fromDto(results[0]);
        }),
      );
  }

  /**
   * Get leads that connected with specific users.
   * @param user User.
   */
  public getLeadsConnectedWith(user: User): Observable<Lead[]> {
    let params = new HttpParams({
      fromObject: {
        ordering: '-created',
      },
    });
    switch (user.role) {
      case Role.Client:
        params = params.set('client', user.id.toString());
        break;
      case Role.Attorney:
        params = params.set('attorney', user.id.toString());
        break;
      default:
        throw new Error(`Unexpected user role ${user.role}`);
    }
    return this.leadChange$ // Re-get leads after some lead change.
      .pipe(
        startWith(null),
        switchMap(() => this.http.get<PaginationDto<LeadDto>>(this.leadsUrl, { params })),
        map(({ results }) => {
          return results.map(leadDto => this.leadMapper.fromDto(leadDto));
        }),
        shareReplay({
          refCount: true,
          bufferSize: 1,
        }),
      );
  }

  /**
   * Create a lead from specific client.
   * @param client Client to create a lead.
   * @param attorney Attorney to create a lead.
   * @param topic- topic from which lead was created.
   */
  public createLead(client: Client, attorney: Attorney, topic: Topic = null): Observable<Lead> {
    const body: CreateLeadDto = {
      client: client.id,
      attorney: attorney.id,
      topic: topic == null ? null : topic.id,
      priority: DEFAULT_LEAD_PRIORITY,
    };
    return this.http.post<LeadDto>(this.leadsUrl, body)
      .pipe(
        map(leadDto => this.leadMapper.fromDto(leadDto)),
        tap(lead => this.leadChange$.next(lead)),
      );
  }

  /**
   * Change lead priority.
   */
  public changeLeadPriority(leadId: number, priority: LeadPriority): Observable<Lead> {
    return this.http.patch<any>(`${this.leadsUrl}${leadId}/`, { priority })
      .pipe(
        map(leadDto => {
          const lead = this.leadMapper.fromDto(leadDto);
          this.leadChange$.next(lead);
          return lead;
        }),
      );
  }

  /**
   * Get lead by id.
   * @param id Id of a lead.
   */
  public getLeadById(id: number): Observable<Lead> {
    const url = new URL(id.toString(), this.leadsUrl).toString();
    return this.http.get<LeadDto>(url).pipe(
      map(leadDto => this.leadMapper.fromDto(leadDto)),
    );
  }
}

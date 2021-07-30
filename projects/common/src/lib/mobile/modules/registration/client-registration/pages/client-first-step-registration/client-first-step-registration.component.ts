import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ClientRegistration } from '@jl/common/core/models';
import { TEntityValidationErrors } from '@jl/common/core/models/api-error';
import { ClientType } from '@jl/common/core/models/client';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { InvitesService } from '@jl/common/core/services/attorney/invites.service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, filter, tap, switchMap, switchMapTo } from 'rxjs/operators';

import { RegistrationStepMergerService } from '../../../services/registration-step-merger.service';

/** Page with the first step of registration for a client. */
@Component({
  selector: 'jlc-client-first-step-registration',
  templateUrl: './client-first-step-registration.component.html',
  styleUrls: ['./client-first-step-registration.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientFirstStepRegistrationComponent {
  /** First step registration fields. */
  public static readonly fields: Array<keyof ClientRegistration> = [
    'firstName',
    'lastName',
    'email',
    'organizationName',
    'clientType',
    'password',
    'passwordConfirm',
  ];

  /** Client type. */
  public readonly clientType = ClientType;

  /** Current client type. */
  public readonly currentClientType$ = new BehaviorSubject<ClientType>(ClientType.Individual);

  /** Is app loading. */
  public readonly isLoading$ = new BehaviorSubject<boolean>(false);

  /** Initial data to prefill the form. */
  public readonly initialData$: Observable<ClientRegistration>;

  /** Validation error. */
  public readonly validationError$: Observable<TEntityValidationErrors<ClientRegistration>>;

  /** To explicitly emit view entering. */
  private readonly viewEnter$ = new Subject<void>();

  /**
   * @constructor
   * @param registrationMerger Registration merger.
   * @param router Router.
   * @param activatedRoute Activated route.
   * @param invitesService Invites service.
   */
  public constructor(
    private readonly registrationMerger: RegistrationStepMergerService<ClientRegistration>,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly invitesService: InvitesService,
  ) {
    this.registrationMerger.clearRegistrationData();

    this.initialData$ = this.initDataStream();

    // Get validation errors on every page opening.
    this.validationError$ = this.viewEnter$.pipe(
      switchMapTo(this.registrationMerger.getValidationError()),
    );
  }

  /** Ionic's hook. It is called on entering the screen. */
  public ionViewWillEnter(): void {
    this.viewEnter$.next();
  }

  /** Handle client type change. */
  public onClientTypeChange(type: ClientType): void {
    this.currentClientType$.next(type);
  }

  /** Save data. */
  public onSubmit(data: Partial<ClientRegistration>): void {
    this.registrationMerger.setRegistrationData(data);
    this.router.navigate(['additional'], {
      relativeTo: this.activatedRoute,
    });
  }

  private initDataStream(): Observable<ClientRegistration> {
    return this.activatedRoute.queryParams.pipe(
      map(({ invite: clientUUID }) => clientUUID),
      filter(uuid => uuid),
      tap(() => this.isLoading$.next(false)),
      switchMap((uuid) => this.invitesService.getInvitedClient(uuid)),
      map(inviteData => new ClientRegistration({
        firstName: inviteData.firstName,
        lastName: inviteData.lastName,
        email: inviteData.email,
        organizationName: inviteData.organizationName,
        clientType: inviteData.clientType,
      })),
      onMessageOrFailed(() => this.isLoading$.next(false)),
    );
  }
}

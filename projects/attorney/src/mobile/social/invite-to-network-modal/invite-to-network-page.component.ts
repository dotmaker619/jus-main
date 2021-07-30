import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { TEntityValidationErrors, ApiValidationError } from '@jl/common/core/models/api-error';
import { Attorney } from '@jl/common/core/models/attorney';
import { Network } from '@jl/common/core/models/network';
import { NetworkInvitation } from '@jl/common/core/models/network-invitation';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { NetworkChatService } from '@jl/common/core/services/chats/network-chat.service';
import { NetworksService } from '@jl/common/core/services/networks.service';
import { trackById } from '@jl/common/core/utils/trackby-id';
import { Observable, BehaviorSubject, of, merge, EMPTY, ReplaySubject } from 'rxjs';
import { tap, switchMapTo, map, switchMap, filter, take, first, catchError, shareReplay } from 'rxjs/operators';

import { SelectAttorneysModalComponent } from '../modals/select-attorneys-modal/select-attorneys-modal.component';

/** Modal for inviting people to a network. */
@Component({
  selector: 'jlat-invite-to-network-page',
  templateUrl: './invite-to-network-page.component.html',
  styleUrls: ['./invite-to-network-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InviteToNetworkPageComponent {
  /** Form group. */
  public readonly form$: Observable<FormGroup>;
  /** Is app loading. */
  public readonly isLoading$ = new BehaviorSubject<boolean>(false);
  /** Trackby function. */
  public readonly trackById = trackById;
  /** Selected attorneys. */
  public readonly selectedAttorneys$: Observable<Attorney[]>;
  /** Validation error. */
  public readonly validationError$ = new ReplaySubject<TEntityValidationErrors<NetworkInvitation>>(1);

  private readonly network$: Observable<Network>;

  /**
   * @constructor
   * @param formBuilder
   * @param activatedRoute
   * @param networksService
   * @param modalController
   * @param router
   * @param networkChatService
   */
  public constructor(
    formBuilder: FormBuilder,
    private readonly activatedRoute: ActivatedRoute,
    private readonly networksService: NetworksService,
    private readonly modalController: ModalController,
    private readonly router: Router,
    private readonly networkChatService: NetworkChatService,
  ) {
    const networkId$ = activatedRoute.paramMap.pipe(
      map(params => parseInt(params.get('id'), 10)),
      filter(id => !isNaN(id)),
    );
    this.network$ = this.initNetworkStream(networkId$);
    this.form$ = this.initFormStream(formBuilder);
    this.selectedAttorneys$ = this.initSelectedAttorneysStream(this.form$);
  }

  /** Handle form submission. */
  public onSubmit(form: FormGroup): void {
    form.markAllAsTouched();
    if (form.invalid || this.isLoading$.value) {
      return;
    }
    this.isLoading$.next(true);

    this.network$.pipe(
      first(),
      switchMap((network) =>
        this.networkChatService.inviteToNetwork(
          form.value.attorneys,
          network,
          form.value.message,
        ),
      ),
      onMessageOrFailed(() => this.isLoading$.next(false)),
      catchError((error: ApiValidationError<NetworkInvitation>) => {
        this.validationError$.next(error.validationData);
        return EMPTY;
      }),
      take(1),
    ).subscribe(() => this.router.navigate(['..'], { relativeTo: this.activatedRoute }));
  }

  /**
   * Handle click on invite button.
   * @param form Form.
   */
  public onInviteButtonClick(form: FormGroup): void {
    this.network$.pipe(
      first(),
      switchMap(({ participants }) => this.modalController.create({
        componentProps: {
          selectedAttorneys: form.value.attorneys,
          preselectedAttorneys: participants,
        },
        component: SelectAttorneysModalComponent,
      })),
      switchMap(modal => modal.present() && modal.onDidDismiss()),
      map(({ data }) => data),
      take(1),
    ).subscribe((data: Attorney[]) =>
      data && form.controls.attorneys.setValue(data));
  }

  private initSelectedAttorneysStream(form$: Observable<FormGroup>): Observable<Attorney[]> {
    return form$.pipe(
      first(),
      switchMap(form => form.controls.attorneys.valueChanges),
    );
  }

  private initNetworkStream(networkId$: Observable<number>): Observable<Network> {
    return networkId$.pipe(
      switchMap(id => this.networksService.getNetworkById(id)),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
  }

  private initFormStream(fb: FormBuilder): Observable<FormGroup> {
    const form = fb.group({
      message: [null, Validators.required],
      attorneys: [null],
    });

    const fillForm$ = this.network$.pipe(
      tap(({ participants }) =>
        form.controls.attorneys.setValue(participants)),
      switchMapTo(EMPTY),
    );

    return merge(of(form), fillForm$);
  }
}

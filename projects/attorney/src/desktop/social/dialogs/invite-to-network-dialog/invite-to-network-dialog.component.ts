import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TEntityValidationErrors, ApiValidationError } from '@jl/common/core/models/api-error';
import { Attorney } from '@jl/common/core/models/attorney';
import { Network } from '@jl/common/core/models/network';
import { NetworkInvitation } from '@jl/common/core/models/network-invitation';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { NetworkChatService } from '@jl/common/core/services/chats/network-chat.service';
import { NetworksService } from '@jl/common/core/services/networks.service';
import { JusLawValidators } from '@jl/common/core/validators/validators';
import { AbstractDialog } from '@jl/common/shared';
import { Observable, BehaviorSubject, of, ReplaySubject, NEVER, merge, EMPTY } from 'rxjs';
import { tap, switchMapTo, map, first, switchMap, catchError, take } from 'rxjs/operators';

interface Options {
  /** The network to invite people in. */
  network: Network;
}

/** Dialog for inviting people to a network. */
@Component({
  selector: 'jlat-invite-to-network-dialog',
  templateUrl: './invite-to-network-dialog.component.html',
  styleUrls: ['./invite-to-network-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InviteToNetworkDialogComponent extends AbstractDialog<Options, NetworkInvitation> {
  /** Form group. */
  public readonly form$: Observable<FormGroup>;
  /** Is app loading. */
  public readonly isLoading$ = new BehaviorSubject<boolean>(false);
  /** Preselected attorneys in network. List can not be changed. */
  public readonly preselectedAttorneys$: Observable<Attorney[]>;
  /** Validation error. */
  public readonly validationError$ = new ReplaySubject<TEntityValidationErrors<NetworkInvitation>>(1);

  private readonly network$ = new ReplaySubject<Network>(1);

  /**
   * @constructor
   * @param formBuilder Form builder.
   * @param networkChatService Group chats service.
   */
  public constructor(
    formBuilder: FormBuilder,
    private readonly networkChatService: NetworkChatService,
  ) {
    super();
    this.form$ = this.initFormStream(formBuilder);
    this.preselectedAttorneys$ = this.network$.pipe(
      map(({ participants }) => participants),
    );
  }

  /** @inheritdoc */
  public afterPropsInit(): void {
    this.network$.next(this.options.network);
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
        )),
      onMessageOrFailed(() => this.isLoading$.next(false)),
      catchError((error: ApiValidationError<NetworkInvitation>) => {
        this.validationError$.next(error.validationData);
        return EMPTY;
      }),
      take(1),
    ).subscribe(() => this.close());
  }

  private initFormStream(fb: FormBuilder): Observable<FormGroup> {
    const form = fb.group({
      attorneys: [null, JusLawValidators.minItems(1)],
      message: [null, Validators.required],
    });

    const fillForm$ = this.network$.pipe(
      tap(network => form.controls.attorneys.setValue(network.participants)),
      switchMapTo(NEVER),
    );

    return merge(of(form), fillForm$);
  }
}

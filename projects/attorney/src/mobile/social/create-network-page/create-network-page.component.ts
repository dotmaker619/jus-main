
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Attorney } from '@jl/common/core/models/attorney';
import { Author } from '@jl/common/core/models/author';
import { Network } from '@jl/common/core/models/network';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { NetworksService } from '@jl/common/core/services/networks.service';
import { JusLawValidators } from '@jl/common/core/validators/validators';
import { AlertService } from '@jl/common/mobile/services/alert.service';
import { BehaviorSubject, Observable, of, from, EMPTY } from 'rxjs';
import { shareReplay, first, catchError, switchMap, map } from 'rxjs/operators';

import { SelectAttorneysModalComponent } from '../modals/select-attorneys-modal/select-attorneys-modal.component';

/** Create network page component. */
@Component({
  selector: 'jlat-create-network-page',
  templateUrl: './create-network-page.component.html',
  styleUrls: ['./create-network-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateNetworkPageComponent {

  /** Is app loading. */
  public readonly isLoading$ = new BehaviorSubject<boolean>(false);

  /** Form. */
  public readonly form$: Observable<FormGroup>;

  /** Selected attorneys. */
  public readonly attorneys$: Observable<Attorney[]>;

  /**
   * @constructor
   * @param formBuilder Form builder.
   * @param groupChatsService Group chats service.
   */
  public constructor(
    formBuilder: FormBuilder,
    private readonly groupChatsService: NetworksService,
    private readonly alertService: AlertService,
    private readonly router: Router,
    private readonly modalController: ModalController,
  ) {
    this.form$ = this.initFormStream(formBuilder);
    this.attorneys$ = this.initAttorneysStream();
  }

  /**
   * Handle form submission.
   * @param form Form.
   */
  public onFormSubmit(form: FormGroup): void {
    form.markAllAsTouched();
    if (form.invalid || this.isLoading$.value) {
      return;
    }

    this.isLoading$.next(true);
    const participants: Attorney[] = form.value.attorneys;
    this.groupChatsService.createNetwork(
      new Network({
        participants,
        title: form.value.title,
      }),
    ).pipe(
      first(),
      onMessageOrFailed(() => this.isLoading$.next(false)),
      switchMap(() => this.alertService.showNotificationAlert({
        header: 'Successful!',
        message: 'Network created',
      })),
      switchMap(() => this.router.navigateByUrl('/social/networks')),
      catchError((err: Error) => {
        return this.alertService.showNotificationAlert({
          header: 'Error',
          message: err.message,
        });
      }),
    ).subscribe();
  }

  /**
   * Handle click on invite button.
   * @param form Form.
   */
  public onInviteButtonClick(form: FormGroup): void {
    const selectedAttorneys = form.value.attorneys || [];
    from(
      this.modalController.create({
        componentProps: { selectedAttorneys },
        component: SelectAttorneysModalComponent,
      }),
    ).pipe(
      switchMap(modal => modal.present() && modal.onDidDismiss()),
      map(({ data }) => data),
    ).subscribe((data: Attorney[] | null) => {
      if (data == null) {
        return;
      }
      form.controls.attorneys.setValue(data);
    });
  }

  private initFormStream(formBuilder: FormBuilder): Observable<FormGroup> {
    const form = formBuilder.group({
      title: [null, Validators.required],
      attorneys: [null, JusLawValidators.minItems(1)],
    });

    return of(form).pipe(
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
  }

  private initAttorneysStream(): Observable<Attorney[]> {
    return this.form$.pipe(
      switchMap(form => form.controls.attorneys.valueChanges),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
  }
}

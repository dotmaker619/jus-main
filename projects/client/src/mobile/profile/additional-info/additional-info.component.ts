import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { Client } from '@jl/common/core/models';
import { TEntityValidationErrors } from '@jl/common/core/models/api-error';
import { catchValidationError } from '@jl/common/core/rxjs';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { AlertService } from '@jl/common/mobile/services/alert.service';
import { Observable, merge, of, NEVER, BehaviorSubject, ReplaySubject, EMPTY } from 'rxjs';
import { shareReplay, tap, switchMapTo, first } from 'rxjs/operators';

/** Client additional info component. For mobile devices. */
@Component({
  selector: 'jlcl-additional-info',
  templateUrl: './additional-info.component.html',
  styleUrls: ['./additional-info.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdditionalInfoComponent {
  /** Is app loading. */
  public readonly isLoading$ = new BehaviorSubject<boolean>(false);
  /** Validation error. */
  public readonly validationError$ = new ReplaySubject<TEntityValidationErrors<Client>>(1);
  /** Additional info control. */
  public readonly form$: Observable<FormGroup>;
  /** Client info. */
  public readonly currentClient$: Observable<Client>;

  /**
   * @constructor
   * @param userService User service.
   * @param formBuilder Form builder.
   * @param alertService Alert service.
   */
  public constructor(
    private readonly userService: CurrentUserService,
    private readonly formBuilder: FormBuilder,
    private readonly alertService: AlertService,
  ) {
    this.currentClient$ = this.initClientStream();
    this.form$ = this.initFormStream(this.currentClient$);
  }

  /**
   * Handle form submission.
   * @param form Form.
   */
  public onSubmit(form: FormGroup): void {
    if (form.untouched || form.invalid || this.isLoading$.value) {
      return;
    }
    this.isLoading$.next(true);
    this.userService.updateClientUser(
      new Client(form.value.client),
    ).pipe(
      first(),
      onMessageOrFailed(() => this.isLoading$.next(false)),
      tap(() => this.alertService.showNotificationAlert({
        header: 'Additional information changed',
      })),
      catchValidationError(({ validationData }) => {
        this.alertService.showNotificationAlert({
          header: 'Some of the fields are filled incorrectly',
        });
        this.validationError$.next(validationData);
        return EMPTY;
      }),
    ).subscribe();
  }

  private initClientStream(): Observable<Client> {
    return this.userService.getClientUser().pipe(
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
  }

  private initFormStream(client$: Observable<Client>): Observable<FormGroup> {
    const form = this.formBuilder.group({
      client: [],
    });
    const fillControl$ = client$.pipe(
      tap(client => form.setValue({ client })),
      switchMapTo(NEVER),
    );
    return merge(of(form), fillControl$).pipe(
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }
}

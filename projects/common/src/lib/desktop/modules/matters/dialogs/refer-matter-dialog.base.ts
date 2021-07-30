import { FormGroup, FormBuilder } from '@angular/forms';
import { TEntityValidationErrors, ApiValidationError } from '@jl/common/core/models/api-error';
import { Matter } from '@jl/common/core/models/matter';
import { Pagination } from '@jl/common/core/models/pagination';
import { ReferMatter } from '@jl/common/core/models/refer-matter';
import { Role } from '@jl/common/core/models/role';
import { User } from '@jl/common/core/models/user';
import { catchValidationError } from '@jl/common/core/rxjs';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { paginate } from '@jl/common/core/rxjs/paginate';
import { MattersService } from '@jl/common/core/services/attorney/matters.service';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { DialogsService } from '@jl/common/shared';
import { AbstractDialog } from '@jl/common/shared/modules/dialogs/abstract-dialog';
import { Observable, BehaviorSubject, Subject, ReplaySubject, EMPTY, NEVER, merge, of } from 'rxjs';
import {
  switchMap,
  first,
  map,
  withLatestFrom,
  tap,
  take,
  switchMapTo,
  startWith,
  mapTo,
  debounceTime,
  scan,
  shareReplay,
} from 'rxjs/operators';

type ReferTo = Role.Attorney | Role.Staff;

/**
 * Base class for modal window to refer matter with users.
 */
export abstract class BaseReferMatterDialog extends AbstractDialog<Matter> {
  /** Refer form. */
  public readonly referForm$: Observable<FormGroup>;
  /** Loading controller. */
  public readonly isLoading$ = new BehaviorSubject(false);
  /** Attorneys list. */
  public readonly users$: Observable<Pagination<User>>;
  /** Validation error. */
  public readonly validationError$ = new BehaviorSubject<TEntityValidationErrors<ReferMatter>>(null);

  /** Search query for users. */
  private readonly searchChanges$ = new BehaviorSubject<string>('');
  /** Emitted when more attorneys requested. */
  private readonly loadMoreUsers$ = new Subject<void>();
  private readonly propsInit$ = new ReplaySubject<void>(1);

  /**
   * @constructor
   *
   * @param fb Form builder.
   * @param mattersService Matters service.
   * @param dialogsService Dialogs service.
   * @param attorneysService Attorneys service.
   * @param userType User type.
   */
  public constructor(
    fb: FormBuilder,
    private readonly mattersService: MattersService,
    private readonly dialogsService: DialogsService,
    private readonly userService: CurrentUserService,
    private readonly userType: ReferTo,
  ) {
    super();
    this.referForm$ = this.initFormGroup(fb);
    this.users$ = this.initUsersStream();
  }

  /**
   * Obtain form button title.
   */
  public get buttonTitle$(): Observable<string> {
    return this.referForm$.pipe(
      switchMap((form) => this.getSelectedUsersFromForm(form)),
      map((users) => users.length > 0 ? 'Update' : 'Send'),
    );
  }

  /**
   * Search uses to work with.
   * @param page Pagination page.
   * @param query Search query.
   */
  protected abstract searchUsers(page: number, query: string): Observable<Pagination<User>>;

  /** @inheritdoc */
  public afterPropsInit(): void {
    this.propsInit$.next();
  }

  /**
   * Handle 'submit' of the refer form.
   * @param form Refer form group instance.
   */
  public onFormSubmit(form: FormGroup): void {
    form.markAllAsTouched();
    if (form.invalid || this.isLoading$.value) {
      return;
    }

    const referMatterData = new ReferMatter({
      id: this.options.id,
      title: form.value.title,
      message: form.value.message,
      emails: form.value.emails,
      users: (form.value.users as User[]).map((a) => a.id),
      userType: this.userType,
    });

    this.isLoading$.next(true);
    this.mattersService.referMatter(referMatterData, this.options).pipe(
      first(),
      onMessageOrFailed(() => this.isLoading$.next(false)),
      switchMap(() => this.showSuccessAlert()),
      catchValidationError((error: ApiValidationError<ReferMatter>) => {
        this.validationError$.next(error.validationData);
        return EMPTY;
      }),
    ).subscribe(() => this.close());
  }

  /**
   * Handle filter submission.
   * Select first attorney found.
   */
  public onFilterSubmit(): void {
    this.users$.pipe(
      first(),
      map((attorneys) => attorneys.items[0]),
      withLatestFrom(this.referForm$),
    ).subscribe(([attorneyToSelect, form]) => {
      if (attorneyToSelect == null) {
        return;
      }
      const control = form.controls.attorneys;
      if (control.value.find((a: User) => a.id === attorneyToSelect.id) == null) {
        control.setValue(control.value.concat(attorneyToSelect));
      }
    });
  }

  /**
   * Emit search query change.
   * @param query Search query.
   */
  public onFilterChange(query: string): void {
    this.searchChanges$.next(query);
  }

  /**
   * Unselect attorney.
   * @param attorneyToUnselect Attorney.
   */
  public onUnselectClick(attorneyToUnselect: User): void {
    this.referForm$.pipe(take(1))
      .subscribe((form) => {
        const selectedUsers = form.controls.users.value as User[];
        form.controls.users.setValue(
          selectedUsers.filter(
            a => a.id !== attorneyToUnselect.id),
        );
      });
  }

  /** Handle requesting more attorneys. */
  public onMoreUsersRequested(): void {
    this.loadMoreUsers$.next();
  }

  /**
   * Handle 'click' of the 'Close' button.
   */
  public onCloseClick(): void {
    this.close();
  }

  private initUsersStream(): Observable<Pagination<User>> {
    const queryChanges$ = this.searchChanges$.pipe(
      mapTo(null),
    );

    return this.propsInit$.pipe(
      switchMapTo(paginate(this.loadMoreUsers$, queryChanges$)),
      withLatestFrom(this.searchChanges$),
      debounceTime(500),
      switchMap(([page, query]) => this.searchUsers(page, query)),
      // Obtain users without the current user.
      map((pagination) => ({
        ...pagination,
        items: pagination.items.filter((a) => a.id !== this.options.attorney.id),
      } as Pagination<User>)),
      scan((acc, val) => ({
        ...val,
        items: val.page === 0 ? val.items : acc.items.concat(val.items),
      })),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
  }

  /**
   * Get selected attorney for 'people-filter-input' component.
   * @param form Refer form.
   */
  public getSelectedUsersFromForm(form: FormGroup): Observable<User[]> {
    const usersCtrl = form.get('users');
    return usersCtrl.valueChanges.pipe(
      startWith(usersCtrl.value),
    );
  }

  private initFormGroup(fb: FormBuilder): Observable<FormGroup> {
    const form = fb.group({
      title: [''],
      message: [''],
      users: [[]],
      emails: [[]],
    });

    const fillSelectedAttorneys$ = this.propsInit$.pipe(
      first(),
      switchMapTo(this.userService.currentUser$),
      tap(curUser => {
        form.patchValue({
          users: this.options.sharedWith.filter(u => u.id !== curUser.id && u.role === this.userType),
        });
      }),
      switchMapTo(NEVER),
    );

    return merge(of(form), fillSelectedAttorneys$).pipe(
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
  }

  private showSuccessAlert(): Promise<void> {
    return this.dialogsService.showInformationDialog({
      title: 'Matter shared',
      message: 'Matter has been shared successfully',
    });
  }
}

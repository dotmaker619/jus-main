import { Component, ChangeDetectionStrategy, forwardRef, Input } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
  ValidationErrors,
  NG_ASYNC_VALIDATORS,
  AsyncValidator,
} from '@angular/forms';
import { Attorney } from '@jl/common/core/models/attorney';
import { Pagination } from '@jl/common/core/models/pagination';
import { Specialty } from '@jl/common/core/models/specialty';
import { paginate } from '@jl/common/core/rxjs/paginate';
import { AttorneysService } from '@jl/common/core/services/attorneys.service';
import { JusLawValidators } from '@jl/common/core/validators/validators';
import { Observable, combineLatest, BehaviorSubject, Subject, of, ReplaySubject, NEVER, merge } from 'rxjs';
import { mapTo, withLatestFrom, debounceTime, switchMap, scan, shareReplay, first, tap, map, switchMapTo, startWith } from 'rxjs/operators';

/** Select attorneys component. */
@Component({
  selector: 'jlat-select-attorneys',
  templateUrl: './select-attorneys.component.html',
  styleUrls: ['./select-attorneys.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectAttorneysComponent),
      multi: true,
    },
    {
      provide: NG_ASYNC_VALIDATORS,
      useExisting: forwardRef(() => SelectAttorneysComponent),
      multi: true,
    },
  ],
})
export class SelectAttorneysComponent implements ControlValueAccessor, AsyncValidator {

  /** Form group. */
  public readonly form$: Observable<FormGroup>;
  /** Attorneys to select. */
  public readonly attorneys$: Observable<Pagination<Attorney>>;
  /** Selected attorneys. */
  public readonly selectedAttorneys$: Observable<Attorney[]>;

  /** Search query for attorneys. */
  private readonly searchChange$ = new BehaviorSubject<string>(null);
  /** Emitted when more attorneys requested. */
  private readonly loadMoreAttorneys$ = new Subject<void>();
  /** Emitted with value from outside the component. */
  private readonly valueChange$ = new ReplaySubject<Attorney[]>();

  /** Search attorneys by specific specialty */
  @Input()
  public set specialty(s: Specialty) {
    this.specialtyChange$.next(s);
  }

  /** Attorneys that can not be unselected. */
  @Input()
  public preselectedAttorneys: Attorney[] = [];

  private readonly onChangeCallbacks: Array<(val: Attorney[]) => void> = [];
  private readonly onTouchedCallbacks: Array<() => void> = [];
  private readonly specialtyChange$ = new BehaviorSubject<Specialty>(null);

  /**
   * @constructor
   * @param formBuilder
   * @param attorneysService
   */
  public constructor(
    formBuilder: FormBuilder,
    private readonly attorneysService: AttorneysService,
  ) {
    this.form$ = this.initFormStream(formBuilder);
    this.attorneys$ = this.initAttorneysStream();
    this.selectedAttorneys$ = this.initSelectedAttorneysStream();
  }

  /** @inheritdoc */
  public validate(): Observable<ValidationErrors | null> {
    const attorneysControl$ = this.form$.pipe(
      map(form => form.controls.attorneys),
    );

    return attorneysControl$.pipe(
      map(control => control.errors),
      first(),
    );
  }

  /** Handle requesting more attorneys. */
  public onMoreAttorneysRequested(): void {
    this.loadMoreAttorneys$.next();
  }

  /** @inheritdoc */
  public writeValue(attorneys: Attorney[]): void {
    this.valueChange$.next(attorneys);
  }

  /** @inheritdoc */
  public registerOnChange(fn: (attorneys: Attorney[]) => void): void {
    this.onChangeCallbacks.push(fn);
  }

  /** @inheritdoc */
  public registerOnTouched(fn: () => void): void {
    this.onTouchedCallbacks.push(fn);
  }

  /**
   * Emit search query change.
   * @param query Search query.
   */
  public onFilterChange(query: string): void {
    this.searchChange$.next(query);
  }

  private initSelectedAttorneysStream(): Observable<Attorney[]> {
    return this.form$.pipe(
      switchMap(form => form.controls.attorneys.valueChanges.pipe(
        map((attorneys: Attorney[]) =>
          attorneys && attorneys.slice()),
        startWith(form.controls.attorneys.value),
      )),
    );
  }

  private initFormStream(formBuilder: FormBuilder): Observable<FormGroup> {
    const form = formBuilder.group({
      attorneys: [[], JusLawValidators.minItems(1)],
    });

    const fillForm$ = this.valueChange$.pipe(
      tap(value => form.controls.attorneys.setValue(value || [], { emitEvent: false })),
    );

    const callOnTouched$ = form.valueChanges.pipe(
      first(),
      tap(() => this.onTouchedCallbacks.forEach(cb => cb())),
    );

    const callOnChange$ = form.valueChanges.pipe(
      tap(({ attorneys }) => this.onChangeCallbacks.forEach(cb => cb(attorneys))),
    );

    const sideEffect$ = merge(
      callOnTouched$,
      callOnChange$,
      fillForm$,
    ).pipe(
      switchMapTo(NEVER),
    );

    return merge(
      of(form),
      sideEffect$,
    ).pipe(
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
  }

  private initAttorneysStream(): Observable<Pagination<Attorney>> {

    const queryChange$ = combineLatest([
      this.specialtyChange$,
      this.searchChange$,
    ]).pipe(
      mapTo(null),
    );

    return paginate(
      this.loadMoreAttorneys$,
      queryChange$,
    ).pipe(
      withLatestFrom(this.searchChange$, this.specialtyChange$),
      debounceTime(500),
      switchMap(([page, query, specialty]) =>
        this.attorneysService.searchForAttorney({
          query, page, specialty: specialty && specialty.id,
        }),
      ),
      // Accumulate pagination data
      scan((acc, val) => ({
        ...val,
        items: val.page === 0 ? val.items : acc.items.concat(val.items),
      })),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
  }

  /**
   * Handle filter submission.
   * Select first attorney found.
   * @param attorneys List of attorneys.
   * @param form Form.
   */
  public onFilterSubmit(attorneys: Attorney[], form: FormGroup): void {
    const [attorneyToSelect] = attorneys;
    if (attorneyToSelect == null) {
      return;
    }
    const control = form.controls.attorneys;
    if (control.value.find(a => a.id === attorneyToSelect.id) == null) {
      control.setValue(control.value.concat(attorneyToSelect));
    }
  }

  /**
   * Unselect attorney.
   * @param attorneyToUnselect Attorney.
   * @param form Form.
   */
  public onUnselectClick(attorneyToUnselect: Attorney, form: FormGroup): void {
    const selectedAttorneys = form.controls.attorneys.value as Attorney[];
    form.controls.attorneys.setValue(
      selectedAttorneys.filter(
        a => a.id !== attorneyToUnselect.id),
    );
  }
}

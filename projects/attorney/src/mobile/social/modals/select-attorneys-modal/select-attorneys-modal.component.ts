import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Attorney } from '@jl/common/core/models/attorney';
import { Pagination } from '@jl/common/core/models/pagination';
import { Specialty } from '@jl/common/core/models/specialty';
import { paginate } from '@jl/common/core/rxjs/paginate';
import { AttorneysService } from '@jl/common/core/services/attorneys.service';
import { SpecialtyService } from '@jl/common/core/services/specialty.service';
import { trackById } from '@jl/common/core/utils/trackby-id';
import { Observable, of, Subject } from 'rxjs';
import { shareReplay, switchMap, withLatestFrom, map, mapTo, startWith, first, skip, scan } from 'rxjs/operators';
/** Ionic modal to select attorneys. */
@Component({
  selector: 'jlat-select-attorneys-modal',
  templateUrl: './select-attorneys-modal.component.html',
  styleUrls: ['./select-attorneys-modal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectAttorneysModalComponent {

  private selectedAttorneysValue: Attorney[];
  /** Attorneys that can not be unselected. */
  private preselectedAttorneysValue = new Array<Attorney>();
  private readonly moreAttorneysRequested$ = new Subject<void>();

  /** Selected attorneys. */
  public get selectedAttorneys(): Attorney[] {
    return this.selectedAttorneysValue;
  }

  /** Selected attorneys. */
  @Input()
  public set selectedAttorneys(attorneys: Attorney[]) {
    this.selectedAttorneysValue = attorneys == null ? [] : attorneys.slice();
  }

  /** Preselected attorneys that can not be unselected. */
  @Input()
  public set preselectedAttorneys(attorneys: Attorney[]) {
    this.preselectedAttorneysValue = attorneys || [];
  }

  /** Filtered attorneys. */
  public readonly filteredAttorneys$: Observable<Pagination<Attorney>>;

  /** Filter form. */
  public readonly filterForm$: Observable<FormGroup>;

  /** Specialties. */
  public readonly specialties$: Observable<Specialty[]>;

  /** Trackby function. */
  public readonly trackById = trackById;

  /**
   * @constructor
   * @param formBuilder
   */
  public constructor(
    formBuilder: FormBuilder,
    specialtiesService: SpecialtyService,
    private readonly attorneysService: AttorneysService,
    private readonly modalController: ModalController,
  ) {
    this.filterForm$ = this.initFormStream(formBuilder);
    this.filteredAttorneys$ = this.initAttorneysStream();
    this.specialties$ = specialtiesService.getSpecialties();
  }

  private initAttorneysStream(): Observable<Pagination<Attorney>> {
    const queryChange$ = this.filterForm$.pipe(
      switchMap(form => form.valueChanges),
      startWith({}), // Start with empty query
      map(({ filter, category }) => ({
        filter: filter as string,
        category: category as Specialty,
      })),
    );

    return paginate(
      this.moreAttorneysRequested$,
      queryChange$.pipe(mapTo(null)),
    ).pipe(
      withLatestFrom(queryChange$),
      switchMap(([page, query]) =>
        this.attorneysService.searchForAttorney({
          page,
          query: query.filter,
          specialty: query.category && query.category.id,
        })),
      scan((acc, val) => ({
        ...val,
        items: val.page === 0 ? val.items : acc.items.concat(val.items),
      })),
      shareReplay({
        refCount: true, bufferSize: 1,
      }),
    );
  }

  private initFormStream(formBuilder: FormBuilder): Observable<FormGroup> {
    const form = formBuilder.group({
      filter: [null],
      category: [null],
    });

    return of(form).pipe(
      shareReplay({
        refCount: true,
        bufferSize: 1,
      }),
    );
  }

  /** Is attorney preselected. */
  public isAttorneyPreselected(attorney: Attorney): boolean {
    return this.preselectedAttorneysValue.find(({ id }) => attorney.id === id) != null;
  }

  /** Check whether the attorney is selected. */
  public isAttorneySelected(attorney: Attorney): boolean {
    return this.selectedAttorneys.some(a => a.id === attorney.id);
  }

  /**
   * Handle attorney selection.
   * @param attorney Attorney.
   */
  public onToggleAttorney(attorney: Attorney): void {
    const attorneyIdx = this.selectedAttorneys.findIndex(a => attorney.id === a.id);
    if (attorneyIdx === -1) {
      this.selectedAttorneys.push(attorney);
    } else {
      this.selectedAttorneys.splice(attorneyIdx, 1);
    }
  }

  /**
   * Close the modal with result.
   * @param attorneys Attorneys to pass as a result.
   */
  public close(attorneys?: Attorney[]): void {
    this.modalController.dismiss(attorneys);
  }

  /** Load next page of attorneys. */
  public loadMoreAttorneys(event: CustomEvent): void {
    this.filteredAttorneys$
      .pipe(skip(1), first()) // Wait for the next update of attorneys
      // @ts-ignore the absence of `complete` on CustomEventTarget
      .subscribe(() => event.target.complete());
    this.moreAttorneysRequested$.next();
  }
}

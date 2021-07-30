import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Attorney } from '@jl/common/core/models/attorney';
import { Network } from '@jl/common/core/models/network';
import { Pagination } from '@jl/common/core/models/pagination';
import { Specialty } from '@jl/common/core/models/specialty';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { NetworksService } from '@jl/common/core/services/networks.service';
import { SpecialtyService } from '@jl/common/core/services/specialty.service';
import { compareWithId } from '@jl/common/core/utils/compare-with';
import { trackById } from '@jl/common/core/utils/trackby-id';
import { JusLawValidators } from '@jl/common/core/validators/validators';
import { AbstractDialog } from '@jl/common/shared';
import { Observable, of, BehaviorSubject, merge, NEVER } from 'rxjs';
import { tap, switchMapTo, first, } from 'rxjs/operators';

/** Create network dialog component. */
@Component({
  selector: 'jlat-create-network-dialog',
  templateUrl: './create-network-dialog.component.html',
  styleUrls: ['./create-network-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateNetworkDialogComponent extends AbstractDialog {
  /** Form group. */
  public readonly form$: Observable<FormGroup>;
  /** Categories to select. */
  public readonly categories$: Observable<Specialty[]>;
  /** Attorneys to select. */
  public readonly attorneys$: Observable<Pagination<Attorney>>;
  /** Comparator function. */
  public readonly compareWithId = compareWithId;
  /** Trackby function. */
  public readonly trackById = trackById;
  /** Is app loading. */
  public readonly isLoading$ = new BehaviorSubject<boolean>(false);

  /** Category change. */
  public readonly selectedCategory$ = new BehaviorSubject<Specialty>(null);

  /**
   * @constructor
   * @param formBuilder Form builder.
   * @param specialtyService Specialty service.
   * @param networksService Group chats service.
   */
  public constructor(
    formBuilder: FormBuilder,
    specialtyService: SpecialtyService,
    private readonly networksService: NetworksService,
  ) {
    super();
    this.categories$ = specialtyService.getSpecialties();
    this.form$ = this.initFormStream(formBuilder);
  }

  /**
   * Handle category change.
   * @param specialty Specialty.
   */
  public onCategoryChange(specialty: Specialty): void {
    this.selectedCategory$.next(specialty);
  }

  /** Handle form submission. */
  public onSubmit(form: FormGroup): void {
    form.markAllAsTouched();
    if (form.invalid || this.isLoading$.value) {
      return;
    }
    this.isLoading$.next(true);
    const attorneys: Attorney[] = form.controls.attorneys.value;
    this.networksService.createNetwork(
      new Network({
        title: form.controls.title.value,
        participants: attorneys,
      }),
    ).pipe(
      first(),
      onMessageOrFailed(() => this.isLoading$.next(false)),
    ).subscribe(() => this.close());
  }

  private initFormStream(formBuilder: FormBuilder): Observable<FormGroup> {
    const form = formBuilder.group({
      title: [null, Validators.required],
      category: [null],
      attorneys: [null, JusLawValidators.minItems(1)],
    });

    const sideEffect$ = form.controls.category.valueChanges.pipe(
      tap((category) => this.onCategoryChange(category)),
      switchMapTo(NEVER),
    );

    return merge(sideEffect$, of(form));
  }
}

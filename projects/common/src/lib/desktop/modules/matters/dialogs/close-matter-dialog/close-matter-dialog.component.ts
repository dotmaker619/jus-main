import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { FormCheckboxesSelect } from '@jl/common/core/forms';
import { ChecklistOption } from '@jl/common/core/models/checklist';
import { Matter } from '@jl/common/core/models/matter';
import { MatterStatus } from '@jl/common/core/models/matter-status';
import { ChecklistsService } from '@jl/common/core/services/attorney/checklists.service';
import { MattersService } from '@jl/common/core/services/attorney/matters.service';
import { JusLawDateUtils } from '@jl/common/core/utils/date-utils';
import { JusLawValidators } from '@jl/common/core/validators/validators';
import { AbstractDialog } from '@jl/common/shared';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { map, first, shareReplay, finalize, switchMap } from 'rxjs/operators';

/** Options for close matter dialog. */
export interface CloseMatterDialogOptions {
  /** Matter. */
  matter: Matter;
}

/** Close matter dialog result. */
export enum CloseMatterDialogResult {
  /** Success closing matter. */
  Success = 0,
  /** Matter closing canceled. */
  Cancel = undefined,
}

/** Closing matter dialog. */
@Component({
  selector: 'jlc-close-matter-dialog',
  templateUrl: './close-matter-dialog.component.html',
  styleUrls: ['./close-matter-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CloseMatterDialogComponent extends AbstractDialog<CloseMatterDialogOptions, CloseMatterDialogResult> {

  /** Form for logging time. */
  public closeMatterForm$: Observable<FormGroup>;

  /** Is loading. */
  public isLoading$ = new BehaviorSubject<boolean>(false);

  /** Checklist to check before closing matter. */
  public checklist$: Observable<ChecklistOption[]>;

  private readonly matter$ = new ReplaySubject<Matter>(1);

  /**
   * @constructor
   * @param mattersService Matters service.
   */
  public constructor(
    private mattersService: MattersService,
    private checklistService: ChecklistsService,
    public fb: FormBuilder,
  ) {
    super();

    this.checklist$ = this.matter$.pipe(
      first(),
      switchMap(matter => this.checklistService.getChecklist({
        matter: matter.id,
      })),
      shareReplay({ bufferSize: 1, refCount: true }),
    );

    this.closeMatterForm$ = this.checklist$.pipe(
      map(checklistItems => this.createForm(checklistItems)),
    );
  }

  /** @inheritdoc */
  public afterPropsInit(): void {
    this.matter$.next(this.matter);
  }

  private createForm(checklistItems: ChecklistOption[]): FormGroup {
    const checklistFormArray = new FormCheckboxesSelect<ChecklistOption>(checklistItems, undefined, Validators.required);
    checklistFormArray.setValidators([JusLawValidators.allChecked('checklist')]);

    return this.fb.group({
      closeDate: [new Date(), [Validators.required]],
      checklist: checklistFormArray,
    });
  }

  /** Matter outgoing from dialog options. */
  public get matter(): Matter {
    return this.options.matter;
  }

  /** Close dialog. */
  public onCloseClicked(): void {
    this.close();
  }

  /**
   * Filter dates for time billing datepicker.
   * @param date
   */
  public filterDatesForMatter = (date: Date): boolean => {
    const fromDate = this.matter
      ? JusLawDateUtils.getStartOfDay(new Date(this.matter.created))
      : new Date(2019, 1, 1);
    const toDate = JusLawDateUtils.getEndOfDay(new Date());
    return +date >= +fromDate && +date <= +toDate;
  }

  /** Revoke matter and close the dialog. */
  public onSubmit(form: FormGroup): void {
    form.markAllAsTouched();
    if (form.valid) {
      this.isLoading$.next(true);

      const closedMatter = new Matter({
        ...this.matter,
        completed: form.value.closeDate as Date,
      });

      this.mattersService.setMatterStatus(closedMatter, MatterStatus.Completed).pipe(
        first(),
        finalize(() => this.isLoading$.next(false)),
      ).subscribe(() => this.close(CloseMatterDialogResult.Success));
    }
  }
}

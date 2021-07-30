import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Matter, SelectOption } from '@jl/common/core/models';
import { ApiValidationError } from '@jl/common/core/models/api-error';
import { ChecklistOption } from '@jl/common/core/models/checklist';
import { MatterStatus } from '@jl/common/core/models/matter-status';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { ChecklistsService } from '@jl/common/core/services/attorney/checklists.service';
import { MattersService } from '@jl/common/core/services/attorney/matters.service';
import { JusLawValidators } from '@jl/common/core/validators/validators';
import { Observable, BehaviorSubject, Subject, of, ReplaySubject } from 'rxjs';
import { first, shareReplay, map, tap, switchMapTo, mapTo, switchMap, startWith } from 'rxjs/operators';

const CHECKLIST_VALIDATION_ERROR = 'All the checkboxes should be selected before submitting';

/** Close matter modal. Used in mobile workspace. */
@Component({
  selector: 'jlc-close-matter-modal',
  templateUrl: './close-matter-modal.component.html',
  styleUrls: ['./close-matter-modal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CloseMatterModalComponent implements OnInit {
  private readonly matter$ = new ReplaySubject<Matter>(1);
  /** Matter */
  @Input()
  public matter: Matter;

  /** Is loading. */
  public isLoading$ = new BehaviorSubject<boolean>(false);

  /** Validation error. */
  public validationError$ = new Subject<ApiValidationError<Matter>>();

  /** Checklist. */
  public checklist$: Observable<SelectOption[]>;

  /** Form. */
  public form$: Observable<FormGroup>;

  /** Is submit disabled. */
  public isSubmitDisabled$: Observable<boolean>;

  /**
   * @constructor
   * @param checklistsService
   * @param formBuilder
   * @param modalController
   * @param mattersService
   */
  public constructor(
    private readonly checklistsService: ChecklistsService,
    private readonly formBuilder: FormBuilder,
    private readonly modalController: ModalController,
    private readonly mattersService: MattersService,
    private readonly router: Router,
  ) {
    this.checklist$ = this.initChecklistStream();
    this.form$ = this.initFormStream();
    this.isSubmitDisabled$ = this.initDisabledStateStream();
  }

  /** Init data. */
  public ngOnInit(): void {
    this.matter$.next(this.matter);
  }

  private initFormStream(): Observable<FormGroup> {
    const form = this.formBuilder.group({
      completed: [new Date().toISOString(), Validators.required],
      checklist: [null],
    });

    const mutateValidators$ = this.checklist$.pipe(
      tap(checklist => form.controls.checklist.setValidators([
        JusLawValidators.containsAll(
          (opt1: SelectOption, opt2: SelectOption) => opt1.value === opt2.value,
          checklist,
          CHECKLIST_VALIDATION_ERROR,
        ),
        Validators.required,
      ])),
      mapTo(form),
    );

    return of(form).pipe(
      switchMapTo(mutateValidators$),
    );
  }

  private initChecklistStream(): Observable<SelectOption[]> {
    return this.matter$.pipe(
      first(),
      switchMap(matter => this.checklistsService.getChecklist({matter: matter.id})),
      map(options => options.map(this.mapChecklistOptionToSelectOption)),
      shareReplay({
        refCount: true,
        bufferSize: 1,
      }),
    );
  }

  private mapChecklistOptionToSelectOption(option: ChecklistOption): SelectOption {
    return {
      label: option.description,
      value: option.id,
    };
  }

  private initDisabledStateStream(): Observable<boolean> {
    const statusToDisable = 'INVALID';
    return this.form$.pipe(
      first(),
      switchMap(form => form.controls.checklist.statusChanges),
      startWith(statusToDisable),
      map(status => status === statusToDisable),
    );
  }

  /** On submit. */
  public onSubmit(form: FormGroup): void {
    if (form.invalid || this.isLoading$.value) {
      return;
    }

    this.isLoading$.next(true);
    const closedMatter = new Matter({
      ...this.matter,
      completed: new Date(form.value.completed),
    });

    this.mattersService.setMatterStatus(closedMatter, MatterStatus.Completed).pipe(
      first(),
      onMessageOrFailed(() => this.isLoading$.next(false)),
    ).subscribe(() => {
      this.close();
      this.router.navigateByUrl('/matters');
    });
  }

  /** On cancel click. */
  public onCancelClick(): void {
    this.close();
  }

  private close(): void {
    this.modalController.dismiss();
  }
}

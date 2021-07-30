import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { ChecklistOption } from '@jl/common/core/models/checklist';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { ChecklistsService } from '@jl/common/core/services/attorney/checklists.service';
import { Observable, ReplaySubject, BehaviorSubject, NEVER, merge, of } from 'rxjs';
import { first, filter, tap, switchMapTo } from 'rxjs/operators';

/**
 * Create or edit closing checklist item.
 */
@Component({
  selector: 'jlat-edit-check-item-modal',
  templateUrl: './edit-check-item-modal.component.html',
  styleUrls: ['./edit-check-item-modal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditCheckItemModalComponent implements OnInit {
  /**
   * Checklist option to edit.
   */
  @Input()
  public item?: ChecklistOption;
  /**
   * Form group stream.
   */
  public readonly itemForm$: Observable<FormGroup>;
  /**
   * Loading controller.
   */
  public readonly isLoading$ = new BehaviorSubject<boolean>(false);
  /**
   * Header title.
   */
  public get headerTitle(): string {
    return this.item ? 'Edit Checklist Item' : 'New Checklist Item';
  }

  private readonly init$ = new ReplaySubject<void>(1);

  /**
   * @constructor
   *
   * @param fb Form builder.
   * @param modalCtrl Modal controller.
   * @param checklistService Checklist service.
   */
  public constructor(
    private readonly fb: FormBuilder,
    private readonly modalCtrl: ModalController,
    private readonly checklistService: ChecklistsService,
  ) {
    this.itemForm$ = this.initFormStream();
  }

  /** @inheritdoc */
  public ngOnInit(): void {
    this.init$.next();
  }

  /**
   * Handle click on 'cancel' button.
   */
  public onCancelClick(): void {
    this.close();
  }

  /**
   * Handle form 'submit' event.
   *
   * @param form Form group.
   */
  public onFormSubmit(form: FormGroup): void {
    form.markAllAsTouched();
    if (form.invalid || this.isLoading$.value) {
      return;
    }
    const body = new ChecklistOption({
      id: this.item ? this.item.id : null,
      description: form.value.description,
    });
    this.isLoading$.next(true);
    let request$: Observable<ChecklistOption>;
    if (body.id) {
      request$ = this.checklistService.updateChecklist(body);
    } else {
      request$ = this.checklistService.createChecklist(body);
    }
    request$
      .pipe(
        first(),
        onMessageOrFailed(() => this.isLoading$.next(false)),
      ).subscribe(() => this.close());
  }

  private initFormStream(): Observable<FormGroup> {
    const form = this.fb.group({
      description: [null, [Validators.required]],
    });

    const fillingForm$ = this.init$
      .pipe(
        filter(() => !!this.item),
        tap(() => form.controls.description.setValue(this.item.description)),
        switchMapTo(NEVER),
      );

    return merge(of(form), fillingForm$);
  }

  private close(): void {
    this.modalCtrl.dismiss();
  }
}

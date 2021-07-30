import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Stage } from '@jl/common/core/models/stage';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { StagesService } from '@jl/common/core/services/attorney/stages.service';
import { Observable, BehaviorSubject, ReplaySubject, NEVER, merge, of } from 'rxjs';
import { first, tap, switchMapTo, filter } from 'rxjs/operators';

/**
 * Create or edit matter stage modal.
 */
@Component({
  selector: 'jlat-edit-stage-modal',
  templateUrl: './edit-stage-modal.component.html',
  styleUrls: ['./edit-stage-modal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditStageModalComponent implements OnInit {
  /**
   * Checklist option to edit.
   */
  @Input()
  public item?: Stage;
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
    return this.item ? 'Edit Stage' : 'New Stage';
  }

  private readonly init$ = new ReplaySubject(1);

  /**
   * @constructor
   *
   * @param fb Form builder.
   * @param modalCtrl Modal controller.
   * @param stageService Stage service.
   */
  public constructor(
    private readonly fb: FormBuilder,
    private readonly modalCtrl: ModalController,
    private readonly stageService: StagesService,
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
    if (form.invalid) {
      return;
    }
    const body = new Stage({
      id: this.item ? this.item.id : null,
      title: form.value.title,
    });
    this.isLoading$.next(true);
    let request$: Observable<Stage>;
    if (body.id) {
      request$ = this.stageService.updateStage(body);
    } else {
      request$ = this.stageService.createStage(body);
    }
    request$
      .pipe(
        first(),
        onMessageOrFailed(() => this.isLoading$.next(false)),
      ).subscribe(() => this.close());
  }

  private initFormStream(): Observable<FormGroup> {
    const form = this.fb.group({
      title: [null, [Validators.required]],
    });

    const fillingForm$ = this.init$
      .pipe(
        filter(() => !!this.item),
        tap(() => form.controls.title.setValue(this.item.title)),
        switchMapTo(NEVER),
      );

    return merge(of(form), fillingForm$);
  }

  private close(): void {
    this.modalCtrl.dismiss();
  }
}

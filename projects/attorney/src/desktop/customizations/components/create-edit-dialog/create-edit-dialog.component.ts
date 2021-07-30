import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ChecklistOption } from '@jl/common/core/models/checklist';
import { Stage } from '@jl/common/core/models/stage';
import { ChecklistsService } from '@jl/common/core/services/attorney/checklists.service';
import { StagesService } from '@jl/common/core/services/attorney/stages.service';
import { AbstractDialog } from '@jl/common/shared';
import { BehaviorSubject } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { CustomizationType } from '../../models/customization-type';

/**
 * Create/edit state dialog options.
 */
export interface CreateEditDialogOptions {
  /**
   * Title.
   */
  title: string;
  /**
   * Stage to create/edit
   */
  customization?: Stage | ChecklistOption;
  /**
   * Customization type.
   */
  customizationType: CustomizationType;
}

/** Dialog component for creating customization item. */
@Component({
  selector: 'jlat-create-edit-stage-dialog',
  templateUrl: './create-edit-dialog.component.html',
  styleUrls: ['./create-edit-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateEditDialogComponent extends AbstractDialog<CreateEditDialogOptions, Stage | ChecklistOption> implements OnInit {
  /** Form. */
  public form: FormGroup;

  /** Is loading. */
  public isLoading$ = new BehaviorSubject<boolean>(false);

  /** Getter for dialog title */
  get dialogTitle(): string {
    return this.options.customizationType === CustomizationType.Stage && 'Title'
      || this.options.customizationType === CustomizationType.Checklist && 'Description';
  }

  /** @constructor */
  constructor(
    private stagesService: StagesService,
    private checklistsService: ChecklistsService,
  ) {
    super();
  }

  /** Init form. */
  public ngOnInit(): void {
    let title = '';

    if (this.options.customization) {
      if (this.options.customizationType === CustomizationType.Stage) {
        title = (this.options.customization as Stage).title;
      } else if (this.options.customizationType === CustomizationType.Checklist) {
        title = (this.options.customization as ChecklistOption).description;
      }
    }

    this.form = new FormGroup({
      title: new FormControl(title, Validators.required),
    });
  }

  /** Cancel. */
  public onCloseClicked(): void {
    this.close();
  }

  /** Create or update stage. */
  public onFormSubmitted(): void {
    this.isLoading$.next(true);
    this.options.customization = { ...this.options.customization };

    if (this.options.customizationType === CustomizationType.Stage) {
      (this.options.customization as Stage).title = this.form.value.title;
    } else if (this.options.customizationType === CustomizationType.Checklist) {
      (this.options.customization as ChecklistOption).description = this.form.value.title;
    }

    let request$;

    if (this.options.customization.id) { // Edit
      if (this.options.customizationType === CustomizationType.Stage) {
        request$ = this.stagesService.updateStage(this.options.customization as Stage);
      } else if (this.options.customizationType === CustomizationType.Checklist) {
        request$ = this.checklistsService.updateChecklist(this.options.customization as ChecklistOption);
      }
    } else { // Create
      if (this.options.customizationType === CustomizationType.Stage) {
        request$ = this.stagesService.createStage(this.options.customization as Stage);
      } else if (this.options.customizationType === CustomizationType.Checklist) {
        request$ = this.checklistsService.createChecklist(this.options.customization as ChecklistOption);
      }
    }

    request$.pipe(
      finalize(() => this.isLoading$.next(false)),
    )
      .subscribe(
        created => this.close(created),
        () => this.close(),
      );
  }
}

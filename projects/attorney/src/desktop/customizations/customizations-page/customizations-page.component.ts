import { Component, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { ApiError } from '@jl/common/core/models/api-error';
import { ChecklistOption } from '@jl/common/core/models/checklist';
import { Stage } from '@jl/common/core/models/stage';
import { ChecklistsService } from '@jl/common/core/services/attorney/checklists.service';
import { StagesService } from '@jl/common/core/services/attorney/stages.service';
import { DialogsService } from '@jl/common/shared';
import { of, BehaviorSubject, Subject, Observable, EMPTY } from 'rxjs';
import { catchError, shareReplay, switchMap, startWith, finalize } from 'rxjs/operators';

import { CreateEditDialogOptions, CreateEditDialogComponent } from '../components/create-edit-dialog/create-edit-dialog.component';
import { DeleteDialogComponent } from '../components/delete-dialog/delete-dialog.component';
import { CustomizationTab } from '../models/customization-tab';
import { CustomizationType } from '../models/customization-type';

const FAIL_DELETE_DIALOG_INFO = {
  title: 'Delete Fail',
};

/** Page customizations component. */
@Component({
  selector: 'jlat-customizations-page',
  templateUrl: './customizations-page.component.html',
  styleUrls: ['./customizations-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomizationsPageComponent implements OnDestroy {
  /** Customization type enum */
  public readonly CustomizationType = CustomizationType;

  private update$ = new BehaviorSubject<void>(void 0);

  /** Loading state subject. */
  public isLoading$ = new BehaviorSubject<boolean>(false);

  /** Stages tab. */
  public stagesTab: CustomizationTab<Stage> = {
    id: 'Stage',
    title: 'Matter Stages',
    buttonTitle: '+ New Stage',
    list$: this.getStagesWithUpdates(this.update$.asObservable()),
  };

  /** Closing checklist tab. */
  public closingChecklistTab: CustomizationTab<ChecklistOption> = {
    id: 'Checklist Item',
    title: 'Matter Closing Checklist',
    buttonTitle: '+ New Item',
    list$: this.getChecklistsWithUpdates(this.update$.asObservable()),
  };

  private destroy$ = new Subject<void>();

  /** @constructor */
  public constructor(
    private stagesService: StagesService,
    private dialogsService: DialogsService,
    private checklistsService: ChecklistsService,
  ) {
  }

  /** Open dialog for create or edit customization. */
  public async openCreateOrEditDialog(type: CustomizationType, customization: Stage | ChecklistOption): Promise<void> {
    const customizationTab = this.getCustomizationTab(type);
    const dialogOptions: CreateEditDialogOptions = {
      customizationType: type,
      title: `New ${customizationTab.id}`,
    };
    if (customization) {
      dialogOptions.title = `Edit ${customizationTab.id}`;
      dialogOptions.customization = customization;
    }

    const result = await this.dialogsService.openDialog(CreateEditDialogComponent, dialogOptions);

    if (result) {
      this.update$.next();
    }
  }

  /** Edit confirm deleting dialog */
  public async openDeleteStageDialog(type: CustomizationType, customization: Stage | ChecklistOption): Promise<void> {
    const result = await this.dialogsService.openDialog(DeleteDialogComponent, {
      title: `Delete ${type}`,
      type,
    });

    if (result) {
      let request$;
      this.isLoading$.next(true);

      if (type === CustomizationType.Stage) {
        request$ = this.stagesService.deleteStage(customization.id);
      } else if (type === CustomizationType.Checklist) {
        request$ = this.checklistsService.deleteChecklist(customization.id);
      }

      request$.pipe(
        catchError((error: ApiError) => {
          this.dialogsService.showInformationDialog({
            title: FAIL_DELETE_DIALOG_INFO.title,
            message: error.message,
          });
          return EMPTY;
        }),
        finalize(() => this.isLoading$.next(false)),
      ).subscribe(() => this.update$.next());
    }
  }

  private getStagesWithUpdates(update$: Observable<void>): Observable<Stage[]> {
    return update$.pipe(
      switchMap(() =>
        this.stagesService.getStages({ ordering: 'id' })
          .pipe(
            startWith(null),
            shareReplay({ bufferSize: 1, refCount: true }),
          ),
      ),
    );
  }

  private getChecklistsWithUpdates(update$: Observable<void>): Observable<ChecklistOption[]> {
    return update$.pipe(
      switchMap(() =>
        this.checklistsService.getChecklist({ ordering: 'id' })
          .pipe(shareReplay({ bufferSize: 1, refCount: true })),
      ),
      catchError(error => of(error)),
    );
  }

  private getCustomizationTab(type: CustomizationType): CustomizationTab<Stage | ChecklistOption> {
    switch (type) {
      case CustomizationType.Stage:
        return this.stagesTab;
      case CustomizationType.Checklist:
        return this.closingChecklistTab;
      default:
        throw new Error(`Cannot get customization tab for type: ${type}`);
    }
  }

  /** Unsubscribe. */
  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

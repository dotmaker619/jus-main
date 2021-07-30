import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ChecklistOption } from '@jl/common/core/models/checklist';
import { ChecklistsService } from '@jl/common/core/services/attorney/checklists.service';
import { Observable, ReplaySubject } from 'rxjs';
import { shareReplay, switchMapTo, startWith, first, filter } from 'rxjs/operators';

import { AlertService } from '../../../../../common/src/lib/mobile/services/alert.service';
import { EditCheckItemModalComponent } from '../edit-check-item-modal/edit-check-item-modal.component';

/**
 * Matter closing checklist page.
 */
@Component({
  selector: 'jlat-matter-closing-checklist-page',
  templateUrl: './matter-closing-checklist-page.component.html',
  styleUrls: ['./matter-closing-checklist-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatterClosingChecklistPageComponent {
  /**
   * List of checklist items.
   */
  public readonly checklistItems$: Observable<ChecklistOption[]>;

  private readonly update$ = new ReplaySubject<void>(1);

  /**
   * @constructor
   *
   * @param modalCtrl Modal controller.
   * @param alertService Alert service.
   * @param checklistsService Checklist service.
   */
  public constructor(
    private readonly modalCtrl: ModalController,
    private readonly alertService: AlertService,
    private readonly checklistsService: ChecklistsService,
  ) {
    this.checklistItems$ = this.initCheckListStream();
  }

  /**
   * Handle 'edit' event of 'jlat-customization-list-item'
   *
   * @param item Checklist option
   */
  public onItemEdit(item: ChecklistOption): void {
    this.openEditChecklistItemModal(item);
  }

  /**
   * Handle 'delete' event of 'jlat-customization-list-item'
   *
   * @param item Checklist option
   */
  public onItemDelete(item: ChecklistOption): void {
    this.alertService.showConfirmation({
      message: `Are you sure you want to delete ${item.description} item?`,
      isDangerous: true,
    })
      .pipe(
        first(),
        filter((ans) => ans),
        switchMapTo(this.checklistsService.deleteChecklist(item.id)),
      ).subscribe(() => this.update$.next());
  }

  /**
   * TrackBy function for the checklist.
   * @param _ Idx.
   * @param item Checklist item.
   */
  public trackChecklistItem(_: number, item: ChecklistOption): number {
    return item.id;
  }

  /**
   * Handle click on 'Create' button.
   */
  public onCreateCheckClick(): void {
    this.openEditChecklistItemModal();
  }

  private async openEditChecklistItemModal(item?: ChecklistOption): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: EditCheckItemModalComponent,
      componentProps: { item },
    });
    modal.present();
    await modal.onDidDismiss();
    this.update$.next();
  }

  private initCheckListStream(): Observable<ChecklistOption[]> {
    return this.update$
      .pipe(
        startWith(null),
        switchMapTo(this.checklistsService.getChecklist()),
        shareReplay({
          refCount: true,
          bufferSize: 1,
        }),
      );
  }
}

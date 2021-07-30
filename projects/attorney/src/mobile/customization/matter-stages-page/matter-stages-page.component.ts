import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Stage } from '@jl/common/core/models/stage';
import { StagesService } from '@jl/common/core/services/attorney/stages.service';
import { Observable, ReplaySubject } from 'rxjs';
import { shareReplay, switchMapTo, startWith, first, filter } from 'rxjs/operators';

import { AlertService } from '../../../../../common/src/lib/mobile/services/alert.service';
import { EditStageModalComponent } from '../edit-stage-modal/edit-stage-modal.component';

/**
 * Matter stages page.
 */
@Component({
  selector: 'jlat-matter-stages-page',
  templateUrl: './matter-stages-page.component.html',
  styleUrls: ['./matter-stages-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatterStagesPageComponent {
  /**
   * Stages list.
   */
  public readonly stages$: Observable<Stage[]>;

  private readonly update$ = new ReplaySubject<void>(1);

  /**
   * @constructor
   *
   * @param modalCtrl Modal controller.
   * @param alertService Alert service.
   * @param stagesService Stages service.
   */
  public constructor(
    private readonly modalCtrl: ModalController,
    private readonly alertService: AlertService,
    private readonly stagesService: StagesService,
  ) {
    this.stages$ = this.initStagesStream();
  }

  /**
   * Handle clicks on 'Create stage' button.
   */
  public async onCreateStage(): Promise<void> {
    this.openEditModal();
  }

  /**
   * Handle 'edit' event of 'jlat-customization-list-item'.
   *
   * @param stage Stage.
   */
  public onStageEdit(stage: Stage): void {
    this.openEditModal(stage);
  }

  /**
   * Handle 'delete' event of 'jlat-customization-list-item'.
   *
   * @param stage Stage.
   */
  public onStageDelete(stage: Stage): void {
    const message = `Are you sure you want to delete ${stage.title} stage?`;
    this.alertService.showConfirmation({
      message,
      isDangerous: true,
    })
      .pipe(
        first(),
        filter((ans) => ans),
        switchMapTo(this.stagesService.deleteStage(stage.id)),
      ).subscribe(() => this.update$.next());
  }

  /**
   * TrackBy function for the stage list.
   *
   * @param _ Idx.
   * @param stage Stage.
   */
  public trackStage(_: number, stage: Stage): number {
    return stage.id;
  }

  /**
   * Init stage stream.
   */
  private initStagesStream(): Observable<Stage[]> {
    return this.update$
      .pipe(
        startWith(null),
        switchMapTo(this.stagesService.getStages()),
        shareReplay({
          refCount: true,
          bufferSize: 1,
        }),
      );
  }

  private async openEditModal(stage?: Stage): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: EditStageModalComponent,
      componentProps: {
        item: stage,
      },
    });
    modal.present();
    await modal.onDidDismiss();
    this.update$.next();
  }
}

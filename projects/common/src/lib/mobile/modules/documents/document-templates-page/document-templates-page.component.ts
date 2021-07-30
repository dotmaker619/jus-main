import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { JuslawDocument } from '@jl/common/core/models/juslaw-document';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { DocumentsService } from '@jl/common/core/services/documents.service';
import { UploadFileModalComponent } from '@jl/common/mobile/modals/upload-file-modal/upload-file-modal.component';
import { AlertService } from '@jl/common/mobile/services/alert.service';
import { Observable, combineLatest } from 'rxjs';
import { shareReplay, switchMap } from 'rxjs/operators';

import { DocumentsPageMobile } from '../documents-page-mobile';

/** Document templates page. */
@Component({
  selector: 'jlc-document-templates-page',
  templateUrl: './document-templates-page.component.html',
  styleUrls: ['./document-templates-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentTemplatesPageComponent extends DocumentsPageMobile {

  /** Documents tree. */
  public readonly templates$: Observable<JuslawDocument[]>;
  /** Folders */
  protected readonly folders$: Observable<JuslawDocument[]>;

  /**
   * @constructor
   * @param documentsService Docs service.
   * @param modalController Modal controller.
   * @param alertService Alert controller.
   * @param activatedRoute Activated route.
   */
  public constructor(
    protected readonly documentsService: DocumentsService,
    protected readonly modalController: ModalController,
    protected readonly alertService: AlertService,
    protected readonly activatedRoute: ActivatedRoute,
  ) {
    super(
      documentsService,
      modalController,
      alertService,
      activatedRoute,
    );
    this.templates$ = this.initDocumentsStream();
    this.folders$ = this.getFolders();
  }

  private initDocumentsStream(): Observable<JuslawDocument[]> {
    return combineLatest([
      this.queryChange$,
    ]).pipe(
      switchMap(([query]) => this.documentsService.getTemplateDocuments(query)),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
  }

  /** @inheritdoc */
  public onUploadFileClick(): void {
    this.isLoading$.next(true);
    this.documentsService.getEditableTemplateFolders().pipe(
      onMessageOrFailed(() => this.isLoading$.next(false)),
      switchMap(folders => this.modalController.create({
        component: UploadFileModalComponent,
        componentProps: {
          folders,
          docusignAvailable: false,
        },
      })),
      switchMap(modal => modal.present() && modal.onDidDismiss()),
    ).subscribe();
  }

  /**
   * Get folders
   */
  public getFolders(): Observable<JuslawDocument[]> {
    return this.documentsService.getEditableTemplateFolders().pipe(
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
  }
}

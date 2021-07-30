import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { JuslawDocument } from '@jl/common/core/models/juslaw-document';
import { DocumentAction } from '@jl/common/core/models/juslaw-documents';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { DocumentsService } from '@jl/common/core/services/documents.service';
import { DuplicateFileModalComponent } from '@jl/common/mobile/modals/duplicate-file-modal/duplicate-file-modal.component';
import { EditDocumentModalComponent } from '@jl/common/mobile/modals/edit-document-modal/edit-document-modal.component';
import { EditFolderModalComponent } from '@jl/common/mobile/modals/edit-folder-modal/edit-folder-modal.component';
import { UploadFileModalComponent } from '@jl/common/mobile/modals/upload-file-modal/upload-file-modal.component';
import { AlertService } from '@jl/common/mobile/services/alert.service';
import { EmittedDocumentAction } from '@jl/common/shared/components/documents-tree/documents-tree.component';
import { from, Observable, BehaviorSubject } from 'rxjs';
import { first, filter, tap, switchMapTo, switchMap, startWith, map, take } from 'rxjs/operators';

/** Base class for documents page on mobile devices. */
export abstract class DocumentsPageMobile {

  /** Is loading. */
  public readonly isLoading$ = new BehaviorSubject<boolean>(false);

  /** Document filter query. */
  protected readonly queryChange$: Observable<string>;

  /** Folders */
  protected abstract folders$: Observable<JuslawDocument[]>;

  private nodeActionMap: Record<DocumentAction, (doc: JuslawDocument) => void> = {
    CopyFile: (doc) => this.duplicateDocument(doc),
    CreateFolder: (doc) => this.onCreateFolderClick(doc.id),
    DeleteFile: (doc) => this.deleteDocument(doc),
    EditFile: (doc) => this.editDocument(doc),
    DeleteFolder: (doc) => this.deleteDocument(doc),
    DownloadFile: (doc) => this.documentsService.browseDocument(doc),
    RenameFolder: (doc) => this.renameFolder(doc),
  };

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
    this.queryChange$ = this.initFilterStream();
  }
  /** Handle node action event. */
  public onNodeAction({ action, document }: EmittedDocumentAction): void {
    this.nodeActionMap[action](document);
  }

  /** On delete document click. */
  public deleteDocument(doc: JuslawDocument): void {
    const message = `Are you sure you want to delete the ${doc.type.toLowerCase()}?`;
    const permissionToDelete$ = this.alertService.showConfirmation({ message, isDangerous: true });

    permissionToDelete$.pipe(
      first(),
      filter(shouldDelete => shouldDelete),
      tap(() => this.isLoading$.next(true)),
      switchMapTo(this.documentsService.deleteDocument(doc)),
      onMessageOrFailed(() => this.isLoading$.next(false)),
    ).subscribe();
  }

  /** On upload file click click. */
  public onUploadFileClick(doc?: JuslawDocument): void {
    from(this.modalController.create({
      component: UploadFileModalComponent,
      componentProps: {
        document: doc,
        docusignAvailable: false,
      },
    })).pipe(
      switchMap(modal => modal.present() && modal.onDidDismiss()),
    ).subscribe();
  }

  /** On rename folder click. */
  public renameFolder(doc: JuslawDocument): void {
    from(this.modalController.create({
      component: EditFolderModalComponent,
      componentProps: {
        folder: doc,
      },
    })).pipe(
      switchMap(modal => modal.present() && modal.onDidDismiss()),
    ).subscribe();
  }

  /** On create folder click. */
  public onCreateFolderClick(parent?: number): void {
    from(this.modalController.create({
      component: EditFolderModalComponent,
      componentProps: {
        parentId: parent,
      },
    })).pipe(
      switchMap(modal => modal.present() && modal.onDidDismiss()),
    ).subscribe();
  }

  /** On duplicate document click. */
  public duplicateDocument(doc: JuslawDocument): void {
    from(this.modalController.create({
      component: DuplicateFileModalComponent,
      componentProps: {
        document: doc,
      },
    })).pipe(
      switchMap(modal => modal.present() && modal.onDidDismiss()),
    ).subscribe();
  }

  private initFilterStream(): Observable<string> {
    return this.activatedRoute.queryParams.pipe(
      map(params => params.query),
      startWith(''),
    );
  }

  private editDocument(doc: JuslawDocument): void {
    this.folders$.pipe(
      switchMap((fold) => this.modalController.create({
        component: EditDocumentModalComponent,
        componentProps: {
          document: doc,
          folders: fold,
        },
      })),
      switchMap(modal => modal.present() && modal.onDidDismiss()),
      take(1),
    ).subscribe();
  }
}

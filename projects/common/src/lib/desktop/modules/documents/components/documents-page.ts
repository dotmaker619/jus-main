import { JlpFile } from '@jl/common/core/models/jlp-file';
import { JuslawDocument } from '@jl/common/core/models/juslaw-document';
import { DocumentAction } from '@jl/common/core/models/juslaw-documents';
import { DocumentsService } from '@jl/common/core/services/documents.service';
import { EditDocumentDialogComponent } from '@jl/common/desktop/modals/edit-document-dialog/edit-document-dialog.component';
import { DialogsService } from '@jl/common/shared';
import { CopyDocumentDialogComponent } from '@jl/common/shared/components/copy-document-dialog/copy-document-dialog.component';
import { EmittedDocumentAction } from '@jl/common/shared/components/documents-tree/documents-tree.component';
import {
  EditFolderDialogComponent,
  EditFolderDialogOptions,
} from '@jl/common/shared/components/edit-folder-dialog/edit-folder-dialog.component';
import {
  UploadDocumentDialogComponent, UploadDocumentDialogResult,
} from '@jl/common/shared/components/upload-document-dialog/upload-document-dialog.component';
import {
  UploadEditedDocumentDialogComponent,
} from '@jl/common/shared/components/upload-edited-file-dialog/upload-edited-file-dialog.component';
import { throwError, BehaviorSubject, Observable } from 'rxjs';
import { first, switchMap, catchError, finalize } from 'rxjs/operators';

/**
 * Base logic for documents page.
 */
export class DocumentsPage {

  /** Should display loading. */
  public readonly isLoading$ = new BehaviorSubject<boolean>(false);

  private nodeActionMap: Record<DocumentAction, (doc: JuslawDocument) => void> = {
    CopyFile: (doc) => this.onCopyFileClick(doc),
    CreateFolder: (doc) => this.onCreateFolderClick(doc.id),
    DeleteFile: (doc) => this.deleteDocument(doc),
    EditFile: (doc) => this.editDocument(doc),
    DeleteFolder: (doc) => this.deleteDocument(doc),
    DownloadFile: (doc) => this.docsService.browseDocument(doc),
    RenameFolder: (doc) => this.renameFolder(doc),
  };

  /**
   * @constructor
   * @param docsService
   * @param dialogsService
   */
  public constructor(
    protected readonly docsService: DocumentsService,
    protected readonly dialogsService: DialogsService,
  ) { }

  /** Handle node action event. */
  public onNodeAction(nodeActionEvent: EmittedDocumentAction): void {
    this.nodeActionMap[nodeActionEvent.action](nodeActionEvent.document);
  }

  /**
   * Open edit-folder dialog to create a folder.
   *
   * @param parentId Id of parent folder.
   */
  public async onCreateFolderClick(parentId?: number): Promise<void> {
    await this.dialogsService.openDialog(EditFolderDialogComponent, {
      parentId,
    } as EditFolderDialogOptions);
  }

  /**
   * Open edit-folder dialog to rename a folder.
   *
   * @param document Document.
   */
  private async renameFolder(document: JuslawDocument): Promise<void> {
    this.dialogsService.openDialog(EditFolderDialogComponent, {
      document,
    });
  }

  /**
   * Open dialog for uploading a file.
   */
  public onUploadFileClick(): void {
    this.isLoading$.next(true);
    this.getFoldersToUploadFile().pipe(
      first(),
      switchMap((folders) => {
        this.isLoading$.next(false);
        return this.dialogsService.openDialog(UploadDocumentDialogComponent, {
          folders,
        });
      }),
      catchError((error) => {
        this.isLoading$.next(false);
        return throwError(error);
      }),
    ).subscribe();
  }

  /**
   * Open dialog for copy a file.
   *
   * @param document Document.
   */
  public onCopyFileClick(document: JuslawDocument): void {
    this.isLoading$.next(true);
    this.getFoldersToUploadFile().pipe(
      first(),
      switchMap((folders) => {
        this.isLoading$.next(false);
        return this.dialogsService.openDialog(CopyDocumentDialogComponent, {
          folders,
          document,
        });
      }),
      catchError((error) => {
        this.isLoading$.next(false);
        return throwError(error);
      }),
    ).subscribe();
  }

  /**
   * Save file after edit at PDF editor.
   *
   * @param file File to save.
   */
  public saveAfterEdit(file: JlpFile): Observable<boolean> {
    this.isLoading$.next(true);
    return this.getFoldersToUploadFile().pipe(
      first(),
      switchMap((folders) => {
        this.isLoading$.next(false);
        return this.dialogsService.openDialog(UploadEditedDocumentDialogComponent, {
          folders,
          file: file,
        });
      }),
      catchError((error) => {
        this.isLoading$.next(false);
        return throwError(error);
      }),
    );
  }

  /** Get folders to upload file. */
  protected getFoldersToUploadFile(): Observable<JuslawDocument[]> {
    return this.docsService.getFolders();
  }

  /**
   * Delete document.
   *
   * @param doc Document.
   */
  private async deleteDocument(doc: JuslawDocument): Promise<void> {
    const shouldDelete = await this.dialogsService.showConfirmationDialog({
      title: 'Delete',
      message: `Are you sure you want to delete ${doc.title}?`,
      confirmationButtonClass: 'danger',
      confirmationButtonText: 'Delete',
    });
    if (shouldDelete) {
      this.isLoading$.next(true);
      this.docsService.deleteDocument(doc).pipe(
        first(),
        finalize(() => this.isLoading$.next(false)),
      ).subscribe(() => {
        this.dialogsService.showSuccessDialog({
          title: 'Deleted',
          message: `${doc.title} successfully deleted!`,
        });
      });
    }
  }

  private editDocument(doc: JuslawDocument): void {
    this.dialogsService.openDialog(EditDocumentDialogComponent, {
      document: doc,
      saveCb: (document) => this.saveAfterEdit(document),
    });
  }
}

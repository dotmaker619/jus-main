import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { DestroyableBase } from '@jl/common/core';
import { Matter } from '@jl/common/core/models';
import { JlpFile } from '@jl/common/core/models/jlp-file';
import { JuslawDocument } from '@jl/common/core/models/juslaw-document';
import { DocumentAction } from '@jl/common/core/models/juslaw-documents';
import { MatterStatus } from '@jl/common/core/models/matter-status';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { MattersService } from '@jl/common/core/services/attorney/matters.service';
import { DocumentsService } from '@jl/common/core/services/documents.service';
import { UsersService } from '@jl/common/core/services/users.service';
import { EditDocumentDialogComponent } from '@jl/common/desktop/modals/edit-document-dialog/edit-document-dialog.component';
import { DialogsService } from '@jl/common/shared';
import { CopyDocumentDialogComponent } from '@jl/common/shared/components/copy-document-dialog/copy-document-dialog.component';
import { EmittedDocumentAction } from '@jl/common/shared/components/documents-tree/documents-tree.component';
import {
  EditFolderDialogComponent,
  EditFolderDialogOptions,
} from '@jl/common/shared/components/edit-folder-dialog/edit-folder-dialog.component';
import {
  UploadDocumentDialogComponent,
} from '@jl/common/shared/components/upload-document-dialog/upload-document-dialog.component';
import {
  UploadEditedDocumentDialogComponent,
} from '@jl/common/shared/components/upload-edited-file-dialog/upload-edited-file-dialog.component';
import { BehaviorSubject, combineLatest, of, throwError, Observable, from, EMPTY } from 'rxjs';
import { tap, switchMap, catchError, startWith, shareReplay, first, takeUntil, filter, finalize, map } from 'rxjs/operators';

/**
 * Client documents component.
 *
 * Contains filtering options for documents attached to a Matter and the documents-tree component.
 */
@Component({
  selector: 'jlc-client-docs',
  templateUrl: './client-docs.component.html',
  styleUrls: ['./client-docs.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientDocsComponent extends DestroyableBase {

  /** Is loading. */
  public isLoading$ = new BehaviorSubject<boolean>(false);

  /** Filter form for 'Client Docs' tab. */
  public clientDocsForm = this.fb.group({
    client: [null],
    matter: [{ value: null, disabled: true }],
    filter: [null],
  });

  /** Client options. */
  public readonly clients$ = this.usersService.getClientsWithMatters();

  /** Matter options. */
  public readonly matters$ = this.clientDocsForm.controls.client.valueChanges.pipe(
    tap(() => {
      // Start loading on every client change.
      this.isLoading$.next(true);

      // Reset matter value after changing a client.
      this.clientDocsForm.controls.matter.setValue(null, { emitEvent: true });
    }),
    // Get options for matter select depending on selected client.
    switchMap((value) =>
      this.mattersService.getMatters({
        client: value,
        statuses: [MatterStatus.Active, MatterStatus.Completed],
      }),
    ),
    tap((matters) => {
      this.isLoading$.next(false);

      // Disable matters select when there is no matters with the client.
      if (matters.length) {
        this.clientDocsForm.controls.matter.enable();
      } else {
        this.clientDocsForm.controls.matter.disable();
      }

      // Select matter if it is single.
      if (matters.length === 1) {
        this.clientDocsForm.controls.matter.setValue(matters[0].id);
      }
    }),
    shareReplay({ refCount: true, bufferSize: 1 }),
    catchError((error) => {
      this.isLoading$.next(false);
      return throwError(error);
    }),
  );

  /** Document tree for 'Client Docs' tab */
  public clientDocuments$: Observable<JuslawDocument[]>;

  /** Selected matter. */
  public selectedMatter$: Observable<Matter>;

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
   *
   * @param docsService Docs service.
   * @param fb Form builder.
   * @param dialogsService Dialogs service.
   * @param usersService Users service.
   * @param mattersService Matters service.
   */
  public constructor(
    private docsService: DocumentsService,
    private fb: FormBuilder,
    private dialogsService: DialogsService,
    private usersService: UsersService,
    private mattersService: MattersService,
  ) {
    super();
    const filterChange$ = combineLatest([
      // We don't want to make a request on every field change, so use only 'matter' and 'filter' fields here.
      this.clientDocsForm.controls.matter.valueChanges.pipe(startWith(null)) as Observable<number>,
      this.clientDocsForm.controls.filter.valueChanges.pipe(startWith(null)) as Observable<string>,
    ]).pipe(shareReplay({ refCount: true, bufferSize: 1 }));

    this.clientDocuments$ = filterChange$.pipe(
      switchMap(([matterId, searchQuery]) => {
        if (matterId == null) {
          // Return empty documents if matter is not selected.
          return of([]);
        }
        // Otherwise - make a request
        return this.docsService.getDocumentsForMatter(matterId, searchQuery);
      }),
    );

    this.selectedMatter$ = filterChange$.pipe(
      switchMap(([matterId]) => {
        if (matterId) {
          return this.matters$.pipe(
            map(matters => matters.find(iterMatter => iterMatter.id === matterId)),
          );
        }
        return EMPTY;
      }),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
  }

  /** Handle node action event. */
  public onNodeAction({ action, document }: EmittedDocumentAction): void {
    this.nodeActionMap[action](document);
  }

  /** Open edit-folder dialog to create a folder. */
  public onCreateFolderClick(parentId?: number): void {
    const matterId = this.clientDocsForm.controls.matter.value;
    from(
      this.dialogsService.openDialog(EditFolderDialogComponent, {
        parentId,
        matterId,
      } as EditFolderDialogOptions),
    ).pipe(
      first(),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  /**
   * Save file after edit at PDF editor.
   *
   * @param file File to save.
   */
  public saveAfterEdit(file: JlpFile): Observable<boolean> {
    this.isLoading$.next(true);
    const matterId = this.clientDocsForm.controls.matter.value;
    return this.docsService.getFolders(matterId).pipe(
      first(),
      onMessageOrFailed(() => this.isLoading$.next(false)),
      switchMap((folders) => {
        return this.dialogsService.openDialog(UploadEditedDocumentDialogComponent, {
          folders,
          matterId,
          file,
        });
      }),
      catchError((error) => throwError(error)),
    );
  }

  /** Open edit-folder dialog to rename a folder*/
  private renameFolder(document: JuslawDocument): void {
    const matterId = this.clientDocsForm.controls.matter.value;
    from(
      this.dialogsService.openDialog(EditFolderDialogComponent, {
        document,
        matterId,
      } as EditFolderDialogOptions),
    ).pipe(
      first(),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  /** Open dialog for uploading a file. */
  public onUploadFileClick(): void {
    this.isLoading$.next(true);

    const matterId = this.clientDocsForm.controls.matter.value;

    const matter$ = this.matters$.pipe(
      first(),
      map(matters => matters.find(({ id }) => matterId === id)),
    );

    combineLatest([
      this.docsService.getFolders(matterId),
      matter$,
    ]).pipe(
      first(),
      tap(() => this.isLoading$.next(false)),
      switchMap(([folders, { isSharedWithCurrentUser }]) =>
        this.dialogsService.openDialog(UploadDocumentDialogComponent, {
          folders,
          matterId,
          isMatterShared: isSharedWithCurrentUser,
        }),
      ),
      catchError((error) => {
        this.isLoading$.next(false);
        return throwError(error);
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  /**
   * Open dialog for copy a file.
   *
   * @param document Document.
   */
  public onCopyFileClick(document: JuslawDocument): void {
    this.isLoading$.next(true);

    const matterId = this.clientDocsForm.controls.matter.value;
    this.docsService.getFolders(matterId).pipe(
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

  /** Delete document. */
  private deleteDocument(doc: JuslawDocument): void {
    from(
      this.dialogsService.showConfirmationDialog({
        title: 'Delete',
        message: `Are you sure you want to delete ${doc.title}?`,
        confirmationButtonClass: 'danger',
        confirmationButtonText: 'Delete',
      }),
    ).pipe(
      filter(shouldDelete => shouldDelete),
      tap(() => this.isLoading$.next(true)),
      switchMap(() => this.docsService.deleteDocument(doc)),
      first(),
      takeUntil(this.destroy$),
      tap(() => {
        this.dialogsService.showSuccessDialog({
          title: 'Deleted',
          message: `${doc.title} successfully deleted!`,
        });
      }),
      finalize(() => this.isLoading$.next(false)),
    ).subscribe();
  }

  private editDocument(doc: JuslawDocument): void {
    this.dialogsService.openDialog(EditDocumentDialogComponent, {
      document: doc,
      saveCb: (document) => this.saveAfterEdit(document),
    });
  }
}

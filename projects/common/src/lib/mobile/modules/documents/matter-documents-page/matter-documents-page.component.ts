import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { DestroyableBase } from '@jl/common/core';
import { Client, Matter } from '@jl/common/core/models';
import { JuslawDocument } from '@jl/common/core/models/juslaw-document';
import { DocumentAction } from '@jl/common/core/models/juslaw-documents';
import { MatterStatus } from '@jl/common/core/models/matter-status';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { MattersService } from '@jl/common/core/services/attorney/matters.service';
import { DocumentsService } from '@jl/common/core/services/documents.service';
import { UsersService } from '@jl/common/core/services/users.service';
import { DuplicateFileModalComponent } from '@jl/common/mobile/modals/duplicate-file-modal/duplicate-file-modal.component';
import { EditDocumentModalComponent } from '@jl/common/mobile/modals/edit-document-modal/edit-document-modal.component';
import { EditFolderModalComponent } from '@jl/common/mobile/modals/edit-folder-modal/edit-folder-modal.component';
import { UploadFileModalComponent } from '@jl/common/mobile/modals/upload-file-modal/upload-file-modal.component';
import { AlertService } from '@jl/common/mobile/services/alert.service';
import { EmittedDocumentAction } from '@jl/common/shared/components/documents-tree/documents-tree.component';
import { Observable, of, BehaviorSubject, merge, ReplaySubject, NEVER, combineLatest, from, Subject } from 'rxjs';
import {
  shareReplay,
  tap,
  filter,
  mapTo,
  switchMap,
  switchMapTo,
  startWith,
  first,
  takeUntil,
  map,
  take,
  withLatestFrom,
} from 'rxjs/operators';

const REQUIRED_MATTER_STATUSES = [MatterStatus.Active, MatterStatus.Completed];

/**
 * Matter docs page component, displays the docs from selected matter.
 * Used in mobile workspace.
 */
@Component({
  selector: 'jlc-matter-documents-page',
  templateUrl: './matter-documents-page.component.html',
  styleUrls: ['./matter-documents-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatterDocumentsPageComponent extends DestroyableBase {

  /** Filter form for 'Client Docs' tab. */
  public readonly form$: Observable<FormGroup>;

  /** Client options. */
  public readonly clients$: Observable<Client[]>;

  /** Documents. */
  public readonly documents$: Observable<JuslawDocument[]>;

  /** Is loading. */
  public readonly isLoading$ = new BehaviorSubject<boolean>(false);

  /** Matter options. */
  public readonly mattersChange$ = new ReplaySubject<Matter[]>(1);

  /** Selected matter. */
  public readonly matter$: Observable<Matter>;

  /** Document filter query. */
  private readonly queryChange$: Observable<string>;

  private readonly updateDocuments$ = new Subject<void>();

  private nodeActionMap: Record<DocumentAction, (doc: JuslawDocument) => void> = {
    CopyFile: (doc) => this.duplicateFile(doc),
    CreateFolder: (doc) => this.createFolder(doc.id),
    DeleteFile: (doc) => this.deleteDocument(doc),
    EditFile: (doc) => this.editDocument(doc),
    DeleteFolder: (doc) => this.deleteDocument(doc),
    DownloadFile: (doc) => this.documentsService.browseDocument(doc),
    RenameFolder: (doc) => this.renameFolder(doc),
  };

  /**
   * @constructor
   * @param formBuilder Form builder.
   * @param documentsService Documents service.
   * @param mattersService Matters service.
   * @param usersService Users service.
   * @param modalController Modal controller.
   * @param alertService Alert service.
   * @param activatedRoute Activated route.
   */
  public constructor(
    private readonly formBuilder: FormBuilder,
    private readonly documentsService: DocumentsService,
    private readonly usersService: UsersService,
    private readonly mattersService: MattersService,
    private readonly modalController: ModalController,
    private readonly alertService: AlertService,
    private readonly activatedRoute: ActivatedRoute,
  ) {
    super();
    this.queryChange$ = this.initFilterStream();
    this.clients$ = this.initClientsStream();
    this.form$ = this.initFormStream();
    this.matter$ = this.initMatterStream();
    this.documents$ = this.initMatterDocumentsStream();
  }

  private initMatterStream(): Observable<Matter> {
    return this.form$.pipe(
      switchMap(form => {
        const matterControl = form.controls.matter;
        return matterControl.valueChanges.pipe(
          startWith(matterControl.value),
        );
      }),
      withLatestFrom(this.mattersChange$),
      map(([matterId, matters]) => matters.find(matter => matter.id === matterId)),
    );
  }

  private initClientsStream(): Observable<Client[]> {
    return this.usersService.getClientsWithMatters().pipe(
      first(),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }

  private initFormStream(): Observable<FormGroup> {
    const form = this.formBuilder.group({
      client: [null],
      matter: [{ value: null, disabled: true }],
    });

    const {
      matter: matterControl,
      client: clientControl,
    } = form.controls;

    // Fill client field with first client from the list.
    const fillClientField$ = this.clients$.pipe(
      filter(clients => clients.length > 0),
      tap((clients) => clientControl.setValue(clients[0].id)),
    );

    // Fill matter field on every client change.
    const fillMatterField$ = clientControl.valueChanges.pipe(
      switchMap(client => this.mattersService.getMatters({
        client,
        statuses: REQUIRED_MATTER_STATUSES,
      }).pipe(first(), startWith([]))),
      tap(matters => this.mattersChange$.next(matters)),
      filter(matters => matters.length > 0),
      tap(matters => matterControl.setValue(matters[0].id)),
    );

    // Disable matter field when there is no matters.
    const toggleMatterFieldDisability$ = this.mattersChange$.pipe(
      tap(matters => {
        if (matters.length > 0) {
          matterControl.enable();
        } else {
          matterControl.disable();
        }
      }),
    );

    const formSideEffects$ = merge(
      fillClientField$,
      fillMatterField$,
      toggleMatterFieldDisability$,
    ).pipe(
      switchMapTo(NEVER),
      mapTo(form),
    );

    return merge(of(form), formSideEffects$).pipe(
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
  }

  private initMatterDocumentsStream(): Observable<JuslawDocument[]> {
    return combineLatest([
      this.matter$,
      this.queryChange$,
      this.updateDocuments$.pipe(startWith(null)),
    ]).pipe(
      switchMap(([matter, query]) =>
        matter ? this.documentsService.getDocumentsForMatter(matter.id, query) : of(null),
      ),
    );
  }

  /** Handle node action event. */
  public onNodeAction({ action, document }: EmittedDocumentAction): void {
    this.nodeActionMap[action](document);
  }

  /**
   * Delete document.
   * @param doc Document to delete.
   */
  private deleteDocument(doc: JuslawDocument): void {
    const message = `Are you sure you want to delete the ${doc.type.toLowerCase()}?`;
    const permission$ = this.alertService.showConfirmation({ message, isDangerous: true });

    permission$.pipe(
      first(),
      takeUntil(this.destroy$),
      filter(shouldDelete => shouldDelete),
      tap(() => this.isLoading$.next(true)),
      switchMapTo(this.documentsService.deleteDocument(doc)),
      onMessageOrFailed(() => this.isLoading$.next(false)),
    ).subscribe(() => this.updateDocuments$.next());
  }

  /**
   * Duplicate document.
   * @param doc Document to duplicate.
   */
  private duplicateFile(doc: JuslawDocument): void {
    from(this.modalController.create({
      component: DuplicateFileModalComponent,
      componentProps: {
        matterId: doc.matter.id,
        document: doc,
      },
    })).pipe(
      switchMap(modal => modal.present() && modal.onDidDismiss()),
    ).subscribe(() => this.updateDocuments$.next());
  }

  /**
   * Upload new document.
   * @param doc Document to duplicate.
   */
  public uploadNewFile(): void {
    this.matter$.pipe(
      first(),
      switchMap(({ id, isSharedWithCurrentUser }) => this.modalController.create({
        component: UploadFileModalComponent,
        componentProps: {
          docusignAvailable: !isSharedWithCurrentUser,
          matterId: id,
        },
      })),
      switchMap(modal => modal.present() && modal.onDidDismiss()),
    ).subscribe(() => this.updateDocuments$.next());
  }

  /**
   * Rename folder.
   * @param doc Document to rename
   */
  private renameFolder(doc: JuslawDocument): void {
    this.openEditingFolderModal(doc.matter, doc).pipe(
      takeUntil(this.destroy$),
    ).subscribe(() => this.updateDocuments$.next());
  }

  /**
   * Create folder.
   * @param parentId Parent id.
   */
  public createFolder(parentId?: number): void {
    this.matter$.pipe(
      first(),
      takeUntil(this.destroy$),
      switchMap((matter) => this.openEditingFolderModal(matter, null, parentId)),
    ).subscribe(() => this.updateDocuments$.next());
  }

  /** Open the modal for editing a folder. */
  private openEditingFolderModal(matter?: Matter, doc?: JuslawDocument, parentId?: number): Observable<void> {
    return from(this.modalController.create({
      component: EditFolderModalComponent,
      componentProps: {
        matter,
        folder: doc,
        parentId: parentId,
      },
    })).pipe(
      switchMap(modal => modal.present() && modal.onDidDismiss().then(() => null)),
    );
  }

  private initFilterStream(): Observable<string> {
    return this.activatedRoute.queryParams.pipe(
      map(params => params.query),
      startWith(''),
    );
  }

  private editDocument(document: JuslawDocument): void {
    this.documentsService.getFolders(document.matter.id).pipe(
      switchMap((folders) => this.modalController.create({
        component: EditDocumentModalComponent,
        componentProps: {
          document,
          folders,
        },
      })),
      switchMap(modal => modal.present() && modal.onDidDismiss()),
      take(1),
    ).subscribe(() => this.updateDocuments$.next());
  }
}

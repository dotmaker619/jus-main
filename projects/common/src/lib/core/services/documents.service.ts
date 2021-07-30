import { HttpErrorResponse, HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfigService } from '@jl/common/core/services/app-config.service';
import { Observable, throwError, combineLatest, of, forkJoin, ReplaySubject } from 'rxjs';
import { map, first, mapTo, catchError, switchMap, shareReplay, tap, startWith, switchMapTo } from 'rxjs/operators';

import { PaginationDto } from '../dto';
import { DocumentDto } from '../dto/document-dto';
import { ApiErrorMapper } from '../mappers/api-error.mapper';
import { DocumentMapper } from '../mappers/document.mapper';
import { JuslawDocumentType } from '../models/document-type';
import { JlpFile } from '../models/jlp-file';
import { JuslawDocument } from '../models/juslaw-document';
import { MatterStatus } from '../models/matter-status';
import { Role } from '../models/role';

import { MattersService } from './attorney/matters.service';
import { CurrentUserService } from './current-user.service';
import { FileStorageService } from './file-storage.service';
import { FileService } from './file.service';

/** Document category. */
enum DocumentCategory {
  /** Private docs. */
  Private = 'private',
  /** Personal pdf templates. */
  Template = 'is_template',
}

interface DocumentQueryOptions {
  /** Matter id. */
  matterId?: number;
  /** Search query. */
  filter?: string;
  /** Document category. */
  category?: DocumentCategory;
}

const DOC_READONLY_MATTER_STATUSES: MatterStatus[] = [
  MatterStatus.Pending,
  MatterStatus.Revoked,
  MatterStatus.Draft,
  MatterStatus.Completed,
];

/** Documents service. */
@Injectable({
  providedIn: 'root',
})
export class DocumentsService {

  private readonly documentsUrl = new URL('documents/', this.appConfig.apiUrl).toString();
  private readonly currentUserRole$: Observable<Role>;
  private readonly updateDocuments$ = new ReplaySubject<void>(1);

  /** Subject emitting when there is a need to update documents. */
  public readonly updateDocs$ = this.updateDocuments$.pipe(
    startWith(null),
    shareReplay({ refCount: true, bufferSize: 1 }),
  );

  /**
   * @constructor
   * @param http HttpClient service.
   * @param appConfig App config.
   * @param apiErrorMapper Error mapper.
   * @param documentsMapper Docs mapper.
   * @param fileStorageService Storage service.
   * @param userService User service.
   * @param fileService File service.
   * @param mattersService Matters service.
   */
  public constructor(
    private readonly http: HttpClient,
    private readonly appConfig: AppConfigService,
    private readonly apiErrorMapper: ApiErrorMapper,
    private readonly documentsMapper: DocumentMapper,
    private readonly fileStorageService: FileStorageService,
    private readonly userService: CurrentUserService,
    private readonly fileService: FileService,
    private readonly mattersService: MattersService,
  ) {
    this.currentUserRole$ = this.userService.currentUser$.pipe(
      map(({ role }) => role),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }

  /**
   * Count number of files in documents list.
   * @param docs Array of documents.
   * @returns Number of files.
   */
  public countFiles(docs: JuslawDocument[]): number {
    return docs.filter(d => !d.isFolder).length;
  }

  /**
   * Get documents.
   *
   * @param matterId Id of a matter.
   * @param category Category id.
   * @param filter Search query.
   */
  private getDocuments({
    matterId,
    category,
    filter,
  }: DocumentQueryOptions): Observable<JuslawDocument[]> {
    let params = new HttpParams();

    if (matterId) {
      params = params.set('matter', matterId.toString());
    }

    if (category) {
      params = params.set(category.toString(), 'true');
    }

    if (filter) {
      params = params.set('search', filter);
    }

    const isReadonly$ = of(matterId).pipe(
      switchMap(id => {
        if (!id) {
          return of(false);
        }
        return this.mattersService.getMatterById(id).pipe(
          map(({ status }) => DOC_READONLY_MATTER_STATUSES.includes(status)),
        );
      }),
      first(),
    );

    const docs$ = this.http.get<PaginationDto<DocumentDto>>(this.documentsUrl, { params }).pipe(
      map(({ results }) => results),
    );

    const request$ = combineLatest([
      docs$,
      isReadonly$,
      this.currentUserRole$.pipe(first()),
    ]).pipe(
      map(([dtoDocs, isReadonly, curRole]) =>
        dtoDocs.map(doc => this.documentsMapper.fromDtoWithActions(doc, curRole, isReadonly)),
      ),
    );

    return this.updateDocs$.pipe(
      switchMapTo(request$),
    );
  }

  /**
   * Get folders for the documents.
   * @param matterId Matter id.
   */
  public getFolders(matterId?: number): Observable<JuslawDocument[]> {
    if (matterId == null) {
      return this.getPrivateFolders();
    }

    return this.getDocuments({ matterId }).pipe(
      map(docs => docs.filter(doc => doc.isFolder)),
    );
  }

  /**
   * Get an array of nodes.
   * @param matterId Id of a matter.
   * @param filter
   */
  public getDocumentsForMatter(matterId: number, filter?: string): Observable<JuslawDocument[]> {
    return combineLatest([
      this.userService.currentUser$,
      this.getDocuments({ matterId, filter }),
      this.updateDocs$,
    ]).pipe(
      first(),
      map(([user, docs]) => {

        // In case of filtering values return only flat array of found files.
        if (filter) {
          return docs.filter(doc => doc.type === JuslawDocumentType.Document);
        } else {

          if (user.role !== Role.Client) {
            // Return node tree.
            return docs;
          }
          return docs.filter(doc => doc.type !== JuslawDocumentType.SharedFolder);
        }
      }),
    );
  }

  /**
   * Get personal docs for an attorney.
   * @param filter Search query.
   * @returns Document tree.
   */
  public getPrivateDocs(filter?: string): Observable<JuslawDocument[]> {
    return this.getDocuments({ filter, category: DocumentCategory.Private });
  }

  /**
   * Get personal folders for an attorney.
   * @returns Folders array tree.
   */
  private getPrivateFolders(): Observable<JuslawDocument[]> {
    return this.getDocuments({ category: DocumentCategory.Private }).pipe(
      map(docs => docs.filter(doc => doc.isFolder)),
    );
  }

  /**
   * Create new folder for the matter.
   * @param folder
   */
  public createFolder(folder: JuslawDocument): Observable<void> {
    const url = new URL('folders/', this.documentsUrl).toString();

    return this.http.post(url, this.documentsMapper.toDto(
      new JuslawDocument({ ...folder, parent: folder.parent || null }),
    )).pipe(
      mapTo(null),
      catchError((httpError: HttpErrorResponse) => {
        const apiError = this.apiErrorMapper.fromDtoWithValidationSupport(httpError, this.documentsMapper);
        return throwError(apiError);
      }),
      tap(() => this.updateDocuments$.next()),
    );
  }

  /**
   * Save document.
   * @param doc Document.
   */
  private saveDocument(doc: JuslawDocument): Observable<void> {
    const url = new URL('documents/', this.documentsUrl);

    return this.http.post(url.toString(), this.documentsMapper.toDto(doc)).pipe(
      mapTo(null),
      // Error is not bound to any control so just return a message.
      catchError(({ error }: HttpErrorResponse) => throwError(new Error(
        error.data && error.data.title && error.data.title[0] ||
        error.data && error.file && error.file[0] ||
        error.detail ||
        error.message,
      ))),
      tap(() => this.updateDocuments$.next()),
    );
  }

  /** Upload file to a folder. */
  public uploadDocuments(files: (File | JlpFile)[], matterId: number, parentFolderId: number): Observable<void> {
    return combineLatest([
      this.fileStorageService.uploadMatterDocs(files),
      of(files.map(file => file.name)),
    ]).pipe(
      map(([fileUrls, fileNames]) => {
        return fileUrls.map((url, idx) => ({
          file: url,
          parent: parentFolderId,
          matter: { id: matterId },
          title: fileNames[idx],
        } as JuslawDocument));
      }),
      // Upload each document.
      switchMap(docs =>
        forkJoin(docs.map(doc => this.saveDocument(doc))),
      ),
      mapTo(null),
    );
  }

  /** Delete document. */
  public deleteDocument(doc: JuslawDocument): Observable<void> {
    const path = doc.isFolder ? 'folders' : 'documents';
    const url = new URL(`${path}/${doc.id}/`, this.documentsUrl);

    return this.http.delete<void>(url.toString())
      .pipe(
        tap(() => this.updateDocuments$.next()),
      );
  }

  /** Duplicate document */
  public duplicateDocument(doc: JuslawDocument, folderId: number): Observable<void> {
    const url = new URL(`documents/${doc.id}/duplicate/`, this.documentsUrl);

    return this.http.post(url.toString(), this.documentsMapper.toDto(new JuslawDocument({
      ...doc,
      parent: folderId,
    }))).pipe(
      mapTo(null),
      // Error is not bound to any control so just return a message.
      catchError(({ error }: HttpErrorResponse) => throwError(new Error(
        error.data &&
        error.data.title && error.data.title[0] ||
        error.data.non_field_errors && error.data.non_field_errors[0] ||
        error.detail ||
        error.message,
      ))),
      tap(() => this.updateDocuments$.next()),
    );
  }

  /** Rename document. */
  public renameDocument(doc: JuslawDocument, newName: string): Observable<void> {

    const path = doc.isFolder ? 'folders' : 'documents';

    const url = new URL(`${path}/${doc.id}/`, this.documentsUrl);

    return this.http.patch(url.toString(), this.documentsMapper.toDto(
      new JuslawDocument({ ...doc, title: newName }),
    )).pipe(
      mapTo(null),
      catchError((httpError: HttpErrorResponse) => {
        const apiError = this.apiErrorMapper.fromDtoWithValidationSupport(httpError, this.documentsMapper);
        return throwError(apiError);
      }),
      tap(() => this.updateDocuments$.next()),
    );
  }

  /**
   * Get document by id.
   * @param id Id of a document.
   */
  public getDocumentById(id: number): Observable<JuslawDocument> {
    const url = new URL(`documents/${id.toString()}/`, this.documentsUrl).toString();
    const request$ = this.http.get<DocumentDto>(url).pipe(
      map(doc => this.documentsMapper.fromDto(doc)),
    );

    return this.updateDocs$.pipe(
      switchMapTo(request$),
    );
  }

  /**
   * Get personal template documents.
   * @param filter Search query.
   */
  public getTemplateDocuments(filter?: string): Observable<JuslawDocument[]> {
    return this.getDocuments({
      category: DocumentCategory.Template,
      filter,
    });
  }

  /**
   * Browse document.
   * @param document Document.
   */
  public browseDocument(document: JuslawDocument): Promise<void> {
    const fileExtensionRegex = /\.\w*$/;
    const fileExtensionMatch = document.file.match(fileExtensionRegex);
    const fileNameHasExtension = document.title.match(fileExtensionRegex) != null;
    return this.fileService.downloadFile(
      document.file,
      fileNameHasExtension ? document.title : `${document.title}${fileExtensionMatch[0]}`);
  }

  /** Get template folders. */
  public getEditableTemplateFolders(): Observable<JuslawDocument[]> {
    const TEMPLATE_FOLDER_TYPES = [
      JuslawDocumentType.GlobalTemplateFolder,
      JuslawDocumentType.TemplateFolder,
    ];
    return this.getDocuments({ category: DocumentCategory.Template }).pipe(
      map(docs =>
        docs
          .filter(doc => !doc.isReadonly)
          .filter(doc => TEMPLATE_FOLDER_TYPES.includes(doc.type))),
    );
  }
}

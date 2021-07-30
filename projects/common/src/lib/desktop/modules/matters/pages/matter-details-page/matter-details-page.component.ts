import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { ActivatedRoute, Router } from '@angular/router';
import { Link } from '@jl/common/core/models';
import { JlpFile } from '@jl/common/core/models/jlp-file';
import { JuslawDocument } from '@jl/common/core/models/juslaw-document';
import { DocumentAction } from '@jl/common/core/models/juslaw-documents';
import { Matter } from '@jl/common/core/models/matter';
import { MatterTopic } from '@jl/common/core/models/matter-topic';
import { RateType } from '@jl/common/core/models/rate-type';
import { TimeBilling } from '@jl/common/core/models/time-billing';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { MediaRecordingService } from '@jl/common/core/services/abstract-media-recording.service';
import { MatterTopicService } from '@jl/common/core/services/attorney/matter-topic.service';
import { MattersService } from '@jl/common/core/services/attorney/matters.service';
import { StagesService } from '@jl/common/core/services/attorney/stages.service';
import { TimeBillingService, BillingPagination } from '@jl/common/core/services/attorney/time-billing.service';
import { ConsentsService } from '@jl/common/core/services/consents.service';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { DocumentsService } from '@jl/common/core/services/documents.service';
import { EditDocumentDialogComponent } from '@jl/common/desktop/modals/edit-document-dialog/edit-document-dialog.component';
import {
  MatterTopicDialogComponent,
  MatterTopicDialogResult,
} from '@jl/common/desktop/modules/matters/dialogs/matter-topic-dialog/matter-topic-dialog.component';
import { DialogsService } from '@jl/common/shared';
import { BaseMatterDetailsPage } from '@jl/common/shared/base-components/matters/matter-details-page.base';
import { CopyDocumentDialogComponent } from '@jl/common/shared/components/copy-document-dialog/copy-document-dialog.component';
import { EmittedDocumentAction } from '@jl/common/shared/components/documents-tree/documents-tree.component';
import {
  UploadEditedDocumentDialogComponent,
} from '@jl/common/shared/components/upload-edited-file-dialog/upload-edited-file-dialog.component';
import { Subject, BehaviorSubject, combineLatest, Observable, throwError, from, EMPTY, of } from 'rxjs';
import { startWith, switchMap, shareReplay, map, finalize, first, catchError, take } from 'rxjs/operators';

import {
  EditFolderDialogComponent,
  EditFolderDialogOptions,
  EditFolderDialogResult,
} from '../../../../../shared/components/edit-folder-dialog/edit-folder-dialog.component';
import {
  UploadDocumentDialogComponent,
} from '../../../../../shared/components/upload-document-dialog/upload-document-dialog.component';
import { MIN_LOG_TIME_DATE } from '../../../../../shared/constants/matter-constants';
import { LogTimeDialogComponent } from '../../../../../shared/modules/dialogs/log-time-dialog/log-time-dialog.component';
import { AddSupportDialogComponent } from '../../dialogs/add-support-dialog/add-support-dialog.component';
import { CloseMatterDialogComponent, CloseMatterDialogResult } from '../../dialogs/close-matter-dialog/close-matter-dialog.component';
import { EditNoteDialogComponent } from '../../dialogs/edit-note-dialog/edit-note-dialog.component';
import { ReferMatterDialogComponent } from '../../dialogs/refer-matter-dialog/refer-matter-dialog.component';

import { BillingTableFilter } from './billings-table-filter';
import { CustomDateAdapter } from './date-adapter';

/** Matter details page component. */
@Component({
  selector: 'jlc-matter-details-page',
  templateUrl: './matter-details-page.component.html',
  styleUrls: ['./matter-details-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
  ],
})
export class MatterDetailsPageComponent extends BaseMatterDetailsPage {
  /** Is component loading. */
  public isLoading$ = new BehaviorSubject<boolean>(false);

  /** Is matter completed. */
  public isMatterCompleted: boolean;

  /** Emits when user closes the modal for logging time. */
  public billingsChange$ = new Subject<void>();

  /** Rate type. */
  public RateType = RateType;

  /** Emits when user closes the modal for note creation. */
  public notesChange$ = new Subject<void>();

  /** Number of notes */
  public notesNumber: number;

  /** List of links for breadcrumbs. */
  public readonly breadcrumbs$: Observable<Link[]>;

  /**
   * Form control for filtration the bills.
  */
  public billingsFilterForm = this.formBuilder.group({
    time: [new Date()],
  });

  /** Number of rows in time billings. */
  public billingsLimitChange$ = new BehaviorSubject<number>(10);

  /** Time billing items. */
  public billings$: Observable<BillingPagination>;

  private matterTopicsChange$ = new Subject<void>();

  /** Matter topics as observable. */
  public matterTopics$: Observable<MatterTopic[]> = this.matterTopicsChange$.pipe(
    startWith(void 0),
    switchMap(() => this.matter$),
    switchMap(({ id: matterId }) =>
      this.matterTopicService.getMatterTopics(matterId)
        .pipe(shareReplay({ bufferSize: 1, refCount: true })),
    ),
  );

  private nodeActionMap: Record<DocumentAction, (doc: JuslawDocument) => void> = {
    CopyFile: (doc) => this.onCopyFileClick(doc),
    CreateFolder: (doc) => this.onCreateFolderClick(doc.id),
    DeleteFile: (doc) => this.deleteDocument(doc),
    EditFile: (doc) => this.editDocument(doc),
    DeleteFolder: (doc) => this.deleteDocument(doc),
    DownloadFile: (doc) => this.documentsService.browseDocument(doc),
    RenameFolder: (doc) => this.renameDocument(doc),
  };

  /**
   * @constructor
   * @param mattersService
   * @param userService
   * @param activatedRoute
   * @param documentsService
   * @param stagesService
   * @param formBuilder
   * @param mediaRecordingService
   * @param consentsService
   * @param dialogService
   * @param timeBillingService
   * @param matterTopicService
   * @param router
   */
  public constructor(
    protected readonly mattersService: MattersService,
    protected readonly userService: CurrentUserService,
    protected readonly activatedRoute: ActivatedRoute,
    protected readonly documentsService: DocumentsService,
    protected readonly stagesService: StagesService,
    protected readonly formBuilder: FormBuilder,
    protected readonly mediaRecordingService: MediaRecordingService,
    protected readonly consentsService: ConsentsService,
    private readonly dialogService: DialogsService,
    private readonly timeBillingService: TimeBillingService,
    private readonly matterTopicService: MatterTopicService,
    private readonly router: Router,
  ) {

    super(
      mattersService,
      userService,
      activatedRoute,
      documentsService,
      stagesService,
      formBuilder,
      mediaRecordingService,
      consentsService,
    );

    this.billings$ = this.initBillingsStream();
    this.breadcrumbs$ = this.matter$.pipe(
      map(({ title, id }) => [
        { label: 'Matters', link: '/matters' },
        { label: title, link: ['/matters', id] },
      ] as Link[]),
    );
  }

  /**
   * Init billings.
   */
  private initBillingsStream(): Observable<BillingPagination> {
    // Set up BillingTableFilter change.
    const billingsFilterChange$: Observable<BillingTableFilter> = this.billingsFilterForm.controls.time.valueChanges.pipe(
      // Start with current date to display time billings for current month.
      startWith(new Date()),
      map((value) => {
        if (value) {

          const selectedDate = new Date(value);

          return {
            fromDate: this.getStartOfMonth(selectedDate),
            toDate: this.getEndOfMonth(selectedDate),
          } as BillingTableFilter;
        }
      }),
    );

    const matter$ = this.matter$.pipe(first());

    return combineLatest([
      billingsFilterChange$,
      this.billingsLimitChange$,
      matter$,
      this.billingsChange$.pipe(startWith(undefined)),
    ]).pipe(
      switchMap(([billingsFilter, billingsLimit, matter]) => {

        const {
          fromDate,
          toDate,
        }: BillingTableFilter = billingsFilter || {};

        return this.timeBillingService.getTimeBillingsForMatter(
          matter.id, fromDate, toDate, billingsLimit);
      }),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }

  /**
   * Get the date of the first day of the month.
   *
   * @param date The date from which we want to get first day of the month.
   */
  public getStartOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  /**
   * Get the date of the last day of the month.
   *
   * @param date The date from which we want to get the last day of the month.
   */
  public getEndOfMonth(date: Date): Date {
    // Get the numeric value of the end of the month.
    const endOfMonth: number = new Date(date.getFullYear(), date.getMonth() + 1) // Firstly, get the next month
      .setDate(0);                                                               // Then, get back one day earlier

    // Convert it to Date.
    return new Date(endOfMonth);
  }

  /** Open matter topic dialog */
  public async openMatterTopicDialog(matter: Matter): Promise<void> {
    const result = await this.dialogService.openDialog(MatterTopicDialogComponent, { matter });

    if (result === MatterTopicDialogResult.Success) {
      this.matterTopicsChange$.next();
    }
  }

  /** Open dialog for time logging. */
  public openLogTimeDialog(timeBilling?: TimeBilling): void {
    this.matter$.pipe(
      first(),
      switchMap(matter => {
        if (timeBilling && !timeBilling.isEditable) {
          return this.dialogService.showInformationDialog(this.billingNotAvailableOptions);
        }
        return this.dialogService.openDialog(LogTimeDialogComponent, {
          matter,
          timeBilling,
        });
      }),
      first(),
    ).subscribe(() => this.billingsChange$.next());
  }

  /** Close matter. */
  public async onCloseMatterClick(): Promise<void> {
    this.matter$.pipe(
      first(),
      switchMap(matter => this.dialogService.openDialog(CloseMatterDialogComponent, {
        matter,
      })),
      first(),
    ).subscribe(() => {
      if (CloseMatterDialogResult.Success) {
        this.router.navigateByUrl('/matters');
      }
    });
  }

  /**
   * Handle 'click' of the 'Refer matter' button.
   */
  public onReferMatterClick(matter: Matter): void {
    this.dialogService.openDialog(ReferMatterDialogComponent, matter);
  }

  /**
   * Handle 'click' of the '+ Support' button.
   * Open modal window to add support to the matter.
   */
  public onAddSupportClick(matter: Matter): void {
    this.dialogService.openDialog(AddSupportDialogComponent, matter);
  }

  /** Open dialog to add note. */
  public addNoteClick(): void {
    const matterId$ = this.matter$.pipe(
      map(({ id }) => id),
      first(),
    );
    matterId$.pipe(
      switchMap(matterId =>
        this.dialogService.openDialog(EditNoteDialogComponent, { matterId })),
      first(),
    ).subscribe(() => this.notesChange$.next());
  }

  /**
   * Change current number of notes.
   * @param num Number of notes.
   */
  public onNotesNumberChange(num: number): void {
    this.notesNumber = num;
  }

  /**
   * Close datepicker after month selection to prevent opening modal for day selection.
   * @param date
   * @param datepicker
   */
  public onMonthSelected(date: Date, datepicker: MatDatepicker<Date>): void {
    this.billingsFilterForm.controls.time.setValue(date);
    datepicker.close();
  }

  /**
   * Filter dates for time billing datepicker.
   * @param date
   */
  public filterDatesForMatter(this: void, date: Date): boolean {
    return +date > +MIN_LOG_TIME_DATE && +date < +new Date();
  }

  /** Update number of billings. */
  public onBillingsLimitChange(num: number): void {
    this.billingsLimitChange$.next(num);
  }

  /** Handle node action event. */
  public onNodeAction({ action, document }: EmittedDocumentAction): void {
    this.nodeActionMap[action](document);
  }

  /** Open create-folder dialog. */
  public async onCreateFolderClick(parentId?: number): Promise<void> {
    this.matter$.pipe(
      first(),
      switchMap(matter => this.dialogService.openDialog(EditFolderDialogComponent, {
        matterId: matter.id,
        parentId: parentId,
      })),
    ).subscribe(() => this.update$.next());

  }

  /** Open dialog for file uploading. */
  public onUploadFileClick(): void {

    this.isLoading$.next(true);
    const matter$ = this.matter$.pipe(
      first(),
    );
    const folders$ = matter$.pipe(
      switchMap((matter) => this.documentsService.getFolders(matter.id)),
      first(),
      onMessageOrFailed(() => this.isLoading$.next(false)),
    );

    combineLatest([
      matter$,
      folders$,
    ]).pipe(
      switchMap(([matter, folders]) => this.dialogService.openDialog(UploadDocumentDialogComponent, {
        folders,
        matterId: matter.id,
        isMatterShared: matter.isSharedWithCurrentUser,
      })),
      first(),
    ).subscribe(() => this.update$.next());
  }

  /**
   * Save file after edit at PDF editor.
   *
   * @param file File to save.
   */
  public saveAfterEdit(file: JlpFile): Observable<boolean> {
    this.isLoading$.next(true);
    const matterId$ = this.matter$.pipe(
      first(),
      map(({ id }) => id),
    );
    const folders$ = matterId$.pipe(
      switchMap((id) => this.documentsService.getFolders(id)),
      first(),
    );
    return combineLatest([
      matterId$,
      folders$,
    ]).pipe(
      onMessageOrFailed(() => this.isLoading$.next(false)),
      switchMap(([matterId, folders]) => {
        return this.dialogService.openDialog(UploadEditedDocumentDialogComponent, {
          folders,
          matterId,
          file: file,
        });
      }),
      catchError((error) => throwError(error)),
      take(1),
    );
  }

  /**
   * Open dialog for copy a file.
   *
   * @param document Document.
   */
  public onCopyFileClick(document: JuslawDocument): void {
    this.isLoading$.next(true);

    const matterId$ = this.matter$.pipe(
      first(),
      map(({ id }) => id),
    );
    const folders$ = matterId$.pipe(
      switchMap((id) => this.documentsService.getFolders(id)),
      first(),
      onMessageOrFailed(() => this.isLoading$.next(false)),
    );

    folders$.pipe(
      first(),
      switchMap((folders) => {
        this.isLoading$.next(false);
        return this.dialogService.openDialog(CopyDocumentDialogComponent, {
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

  /** @inheritdoc */
  protected requestFileNameFromUser(label: string, header: string, message?: string): Observable<string> {
    return of(null).pipe(
      switchMap(() => this.dialogService.showInputDialog({
        title: header,
        message: message,
        inputLabelText: label,
        confirmButtonText: 'Submit',
      })),
      switchMap((val) => val === undefined ? EMPTY : of(val)),
    );
  }

  /** Delete document. */
  private async deleteDocument(doc: JuslawDocument): Promise<void> {
    const shouldDelete = await this.dialogService.showConfirmationDialog({
      title: 'Delete',
      message: `Are you sure you want to delete ${doc.title}?`,
      confirmationButtonClass: 'danger',
      confirmationButtonText: 'Delete',
    });
    if (shouldDelete) {
      this.isLoading$.next(true);
      this.documentsService.deleteDocument(doc).pipe(
        first(),
        finalize(() => this.isLoading$.next(false)),
      ).subscribe(() => {
        this.update$.next();
        this.dialogService.showSuccessDialog({
          title: 'Deleted',
          message: `${doc.title} successfully deleted!`,
        });
      });
    }
  }

  /** Rename document. */
  private async renameDocument(document: JuslawDocument): Promise<void> {
    const result = await this.dialogService.openDialog(EditFolderDialogComponent, {
      document,
    } as EditFolderDialogOptions);

    if (result === EditFolderDialogResult.Success) {
      this.update$.next();
    }
  }

  /**
   * Checks whether the matter has billed time.
   *
   * @param matter Matter.
   */
  public hasBilledTime(matter: Matter): boolean {
    return matter.timeBilled != null;
  }

  /**
   * Open modal for editing a job.
   *
   * @param timeBilling Job.
   */
  public onTimeBillingClicked(timeBilling: TimeBilling): void {
    this.openLogTimeDialog(timeBilling);
  }

  private editDocument(doc: JuslawDocument): void {
    this.dialogService.openDialog(EditDocumentDialogComponent, {
      document: doc,
      saveCb: (document) => this.saveAfterEdit(document),
    });
  }

  /** @inheritdoc */
  protected notifyError(message: string): Promise<void> {
    return this.dialogService.showInformationDialog({
      title: 'Record Consent',
      message,
    });
  }
}

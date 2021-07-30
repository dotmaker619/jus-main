import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ModalController, AlertController } from '@ionic/angular';
import { Matter } from '@jl/common/core/models';
import { JuslawDocument } from '@jl/common/core/models/juslaw-document';
import { DocumentAction } from '@jl/common/core/models/juslaw-documents';
import { MatterStatus } from '@jl/common/core/models/matter-status';
import { MatterTopic } from '@jl/common/core/models/matter-topic';
import { Note } from '@jl/common/core/models/note';
import { Pagination } from '@jl/common/core/models/pagination';
import { Period } from '@jl/common/core/models/period';
import { TimeBilling } from '@jl/common/core/models/time-billing';
import { onMessageOrFailed } from '@jl/common/core/rxjs/on-message-or-failed';
import { MediaRecordingService } from '@jl/common/core/services/abstract-media-recording.service';
import { MatterTopicService } from '@jl/common/core/services/attorney/matter-topic.service';
import { MattersService } from '@jl/common/core/services/attorney/matters.service';
import { NotesService } from '@jl/common/core/services/attorney/notes.service';
import { StagesService } from '@jl/common/core/services/attorney/stages.service';
import { BillingPagination, TimeBillingService } from '@jl/common/core/services/attorney/time-billing.service';
import { CallsService } from '@jl/common/core/services/calls.service';
import { ConsentsService } from '@jl/common/core/services/consents.service';
import { CurrentUserService } from '@jl/common/core/services/current-user.service';
import { DocumentsService } from '@jl/common/core/services/documents.service';
import { DuplicateFileModalComponent } from '@jl/common/mobile/modals/duplicate-file-modal/duplicate-file-modal.component';
import { EditDocumentModalComponent } from '@jl/common/mobile/modals/edit-document-modal/edit-document-modal.component';
import { EditFolderModalComponent } from '@jl/common/mobile/modals/edit-folder-modal/edit-folder-modal.component';
import { LogTimeModalMobileComponent } from '@jl/common/mobile/modals/log-time-modal-mobile/log-time-modal-mobile.component';
import { UploadFileModalComponent } from '@jl/common/mobile/modals/upload-file-modal/upload-file-modal.component';
import { BaseMatterDetailsPage } from '@jl/common/shared/base-components/matters/matter-details-page.base';
import { EmittedDocumentAction } from '@jl/common/shared/components/documents-tree/documents-tree.component';
import { Observable, BehaviorSubject, combineLatest, ReplaySubject, of, EMPTY } from 'rxjs';
import { shareReplay, switchMap, first, takeUntil, filter, switchMapTo, map, tap, take } from 'rxjs/operators';

import { AlertService } from '../../../services/alert.service';

import { AddSupportModalComponent } from './modals/add-support-modal/add-support-modal.component';
import { CloseMatterModalComponent } from './modals/close-matter-modal/close-matter-modal.component';
import { EditNoteModalComponent } from './modals/edit-note-modal/edit-note-modal.component';
import { NewMessageModalComponent } from './modals/new-message-modal/new-message-modal.component';
import { ReferMatterModalComponent } from './modals/refer-matter-modal/refer-matter-modal.component';

/** Tab options. */
enum Tabs {
  /** Documents. */
  Documents = 'Documents',
  /** Notes. */
  Notes = 'Notes',
  /** Consents. */
  Consents = 'Consents',
}

/** Matter details page. */
@Component({
  selector: 'jlc-matter-details-page',
  templateUrl: './matter-details-page.component.html',
  styleUrls: ['./matter-details-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatterDetailsPageComponent extends BaseMatterDetailsPage {
  /** Is loading. */
  public readonly isLoading$ = new BehaviorSubject<boolean>(false);

  /** Matter notes. */
  public readonly notes$: Observable<Pagination<Note>>;
  private readonly notesLimitChange$ = new ReplaySubject<number>(1);

  /** Time billings with pagination */
  public readonly timeBillings$: Observable<BillingPagination>;
  private readonly billingsPeriodChange$ = new ReplaySubject<Period>(1);

  /** Matter topics. */
  public readonly matterTopics$: Observable<MatterTopic[]>;

  /** Matter detail tabs. */
  public readonly tabs = Tabs;

  /** Shows the user can't contact with a client. */
  public readonly shouldDisplayContactButtons$: Observable<boolean>;

  /** Selected tab. */
  private selectedTabValue: Tabs;

  /** Get selected tab. */
  public get selectedTab(): Tabs {
    return this.selectedTabValue;
  }

  /** Set new selected tab. */
  public set selectedTab(v: Tabs) {
    this.selectedTabValue = v;

    // To improve speed rendering selected tab on init.
    this.cdr.detectChanges();
  }

  private nodeActionMap: Record<DocumentAction, (doc: JuslawDocument) => void> = {
    CopyFile: (doc) => this.duplicateDocument(doc),
    CreateFolder: (doc) => this.addFolder(doc.id),
    DeleteFile: (doc) => this.deleteDocument(doc),
    EditFile: (doc) => this.editDocument(doc),
    DeleteFolder: (doc) => this.deleteDocument(doc),
    DownloadFile: (doc) => this.documentsService.browseDocument(doc),
    RenameFolder: (doc) => this.renameDocument(doc),
  };

  /**
   * @constructor
   * @param mattersService Matters service.
   * @param documentsService Documents service.
   * @param notesService Notes service.
   * @param activatedRoute Activated route.
   * @param billingService Time billing service.
   * @param matterTopicService Matter topic service.
   * @param stagesService Matter stages service.
   * @param formBuilder Form builder.
   * @param modalController Modal controller.
   * @param alertService Alert controller.
   * @param cdr Change detector.
   * @param modalCtrl Modal controller.
   * @param userService User service.
   * @param callsService Calls service.
   * @param mediaRecordingService Media recording service.
   * @param consentsService Consents service.
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
    private readonly notesService: NotesService,
    private readonly billingService: TimeBillingService,
    private readonly matterTopicService: MatterTopicService,
    private readonly modalController: ModalController,
    private readonly alertService: AlertService,
    private readonly cdr: ChangeDetectorRef,
    private readonly modalCtrl: ModalController,
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

    this.notes$ = this.initNotesStream();
    this.timeBillings$ = this.initTimeBillingsStream();
    this.matterTopics$ = this.initMatterTopicsStream();
    this.shouldDisplayContactButtons$ = this.initButtonsDisplayingStream();
  }

  private initNotesStream(): Observable<Pagination<Note>> {
    return combineLatest([
      this.notesLimitChange$,
      this.matter$,
    ]).pipe(
      switchMap(([notesNum, matter]) => this.notesService.getNotes(matter.id, notesNum)),
      shareReplay({
        refCount: true,
        bufferSize: 1,
      }),
    );
  }

  /** Handle node action event. */
  public onNodeAction({ action, document }: EmittedDocumentAction): void {
    this.nodeActionMap[action](document);
  }

  private initTimeBillingsStream(): Observable<BillingPagination> {
    return combineLatest([
      this.matter$,
      this.billingsPeriodChange$,
    ]).pipe(
      switchMap(([matter, period]) =>
        this.billingService.getTimeBillingsForMatter(matter.id, period.from, period.to)),
    );
  }

  private initMatterTopicsStream(): Observable<MatterTopic[]> {
    return this.matter$.pipe(
      switchMap(({ id }) => this.matterTopicService.getMatterTopics(id)),
      shareReplay({
        bufferSize: 1,
        refCount: true,
      }),
    );
  }

  private initButtonsDisplayingStream(): Observable<boolean> {
    return this.matter$.pipe(
      map(matter => matter.status === MatterStatus.Active),
    );
  }

  /** On time bill button click. */
  public onTimeBillClick(billing?: TimeBilling): void {
    this.matter$.pipe(
      first(),
      takeUntil(this.destroy$),
      switchMap(matter => this.modalController.create({
        component: LogTimeModalMobileComponent,
        componentProps: {
          options: {
            matter,
            timeBilling: billing,
          },
        },
      })),
      switchMap(modal => modal.present() && modal.onDidDismiss()),
    ).subscribe(() => this.update$.next());
  }

  /** Revoke mattter. */
  public revokeMatter(): void {
    const message = 'Are you sure you want to revoke the matter?';
    this.alertService.showConfirmation({
      message,
      buttonText: 'Revoke',
      isDangerous: true,
    }).pipe(
      filter(shouldDelete => shouldDelete),
      tap(() => this.isLoading$.next(true)),
      switchMapTo(this.matter$.pipe(first())),
      switchMap((matter) => this.mattersService.setMatterStatus(matter, MatterStatus.Revoked)),
      first(),
      onMessageOrFailed(() => this.isLoading$.next(false)),
      tap(() => this.alertService.showNotificationAlert({
        header: 'Revoked', message: 'Matter was revoked',
      })),
    ).subscribe(() => this.update$.next());
  }

  /**
   * Handle 'click' of the 'Refer matter' button.
   */
  public async referMatter(): Promise<void> {
    this.matter$.pipe(
      switchMap((matter) => this.modalCtrl.create({
        component: ReferMatterModalComponent,
        componentProps: { matter },
      })),
      first(),
    ).subscribe((modal) => modal.present());
  }

  /**
   * Handle 'click' of the '+ Support' button.
   */
  public async addSupports(): Promise<void> {
    this.matter$.pipe(
      first(),
      switchMap((matter) => this.modalCtrl.create({
        component: AddSupportModalComponent,
        componentProps: { matter },
      })),
    ).subscribe((modal) => modal.present());
  }

  /** Reopen matter. */
  public reopenMatter(): void {
    this.matter$.pipe(
      first(),
      takeUntil(this.destroy$),
      tap(() => this.isLoading$.next(true)),
      switchMap((matter) => this.mattersService.setMatterStatus(matter, MatterStatus.Active)),
      onMessageOrFailed(() => this.isLoading$.next(false)),
      tap(() => this.alertService.showNotificationAlert({
        header: 'Reopened', message: 'Matter was reopened',
      })),
    ).subscribe(() => this.update$.next());
  }

  /** Close matter. */
  public closeMatter(): void {
    this.matter$.pipe(
      first(),
      takeUntil(this.destroy$),
      switchMap(matter => this.modalController.create({
        component: CloseMatterModalComponent,
        componentProps: {
          matter,
        },
      })),
      switchMap(modal => modal.present() && modal.onDidDismiss()),
    ).subscribe(() => this.update$.next());
  }

  /** Add a note. */
  public addNote(): void {
    this.matter$.pipe(
      first(),
      takeUntil(this.destroy$),
      switchMap(matter => this.modalController.create({
        component: EditNoteModalComponent,
        componentProps: {
          matter,
        },
      })),
      switchMap(modal => modal.present() && modal.onDidDismiss()),
    ).subscribe(() => this.update$.next());
  }

  /** Add a folder. */
  public addFolder(parent?: number): void {
    this.matter$.pipe(
      first(),
      takeUntil(this.destroy$),
      switchMap(matter => this.modalController.create({
        component: EditFolderModalComponent,
        componentProps: {
          matter,
          parentId: parent,
        },
      })),
      switchMap(modal => modal.present() && modal.onDidDismiss()),
    ).subscribe(() => this.update$.next());
  }

  /** Upload new file. */
  public uploadFile(): void {
    combineLatest([
      this.matter$,
      this.isAble(this.permissions.DocusignUpload),
    ]).pipe(
      first(),
      takeUntil(this.destroy$),
      switchMap(([matter, docusignAvailable]) => this.modalController.create({
        component: UploadFileModalComponent,
        componentProps: {
          matterId: matter.id,
          docusignAvailable: docusignAvailable && !matter.isSharedWithCurrentUser,
        },
      })),
      switchMap(modal => modal.present() && modal.onDidDismiss()),
    ).subscribe(() => this.update$.next());
  }

  /** On tab change. */
  public onTabChange(tab: Tabs): void {
    this.selectedTab = tab;
  }

  /** On notes limit change. */
  public onNotesLimitChange(number: number): void {
    this.notesLimitChange$.next(number);
  }

  /**
   * Open modal to create a new message.
   */
  public async openNewMessageModal(matter: Matter): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: NewMessageModalComponent,
      componentProps: { matter },
    });

    modal.present();
  }

  /**
   * On period change.
   *
   * @param period Date period.
   */
  public onBillingsPeriodChange(period: Period): void {
    this.billingsPeriodChange$.next(period);
  }

  /**
   * On delete document.
   * @param doc Document element.
   */
  private deleteDocument(doc: JuslawDocument): void {
    const message = `Are you sure you want to delete the ${doc.type.toLowerCase()}?`;
    const permissionToDelete$ = this.alertService.showConfirmation({ message, isDangerous: true });

    permissionToDelete$.pipe(
      first(),
      takeUntil(this.destroy$),
      filter(shouldDelete => shouldDelete),
      tap(() => this.isLoading$.next(true)),
      switchMapTo(this.documentsService.deleteDocument(doc)),
      onMessageOrFailed(() => this.isLoading$.next(false)),
    ).subscribe(() => this.update$.next());
  }

  /**
   * On paste document click.
   * @param document Document element.
   */
  private duplicateDocument(document: JuslawDocument): void {
    this.matter$.pipe(
      first(),
      takeUntil(this.destroy$),
      switchMap(matter => this.modalController.create({
        component: DuplicateFileModalComponent,
        componentProps: {
          matterId: matter.id,
          document,
        },
      })),
      switchMap(modal => modal.present() && modal.onDidDismiss()),
    ).subscribe(() => this.update$.next());
  }

  /**
   * On rename document click.
   * @param doc Document element.
   */
  private renameDocument(doc: JuslawDocument): void {
    this.matter$.pipe(
      first(),
      takeUntil(this.destroy$),
      switchMap((matter) => this.modalController.create({
        component: EditFolderModalComponent,
        componentProps: {
          matter: matter,
          folder: doc,
        },
      })),
      switchMap(modal => modal.present() && modal.onDidDismiss()),
    ).subscribe(() => this.update$.next());
  }

  /**
   * Handle click on a job.
   * @param billing Job.
   */
  public onBillingClick(billing: TimeBilling): void {
    if (!billing.isEditable) {
      this.notifyBillingError();
      return;
    }
    this.onTimeBillClick(billing);
  }

  private notifyBillingError(): void {
    this.alertService.showNotificationAlert({
      header: this.billingNotAvailableOptions.title,
      message: this.billingNotAvailableOptions.message,
      buttonText: 'Close',
    });
  }

  private editDocument(doc: JuslawDocument): void {
    this.isLoading$.next(true);
    this.documentsService.getFolders(doc.matter.id).pipe(
      onMessageOrFailed(() => this.isLoading$.next(false)),
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

  /** @inheritdoc */
  protected notifyError(message: string): Promise<void> {
    return this.alertService.showNotificationAlert({
      header: 'Record Consent',
      message,
    });
  }

  /** @inheritdoc */
  protected requestFileNameFromUser(label: string, header: string, message?: string): Observable<string> {
    return of(null).pipe(
      switchMap(() => this.alertService.showInputDialog({
        buttonText: 'Submit',
        header: header,
        message: message,
        placeholder: label,
      })),
      switchMap((val) => val === undefined ? EMPTY : of(val)),
    );
  }
}
